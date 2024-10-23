import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Container } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import supabase from '../components/database';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const [peopleData, setPeopleData] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [genderData, setGenderData] = useState([]);
    const [unitSales, setUnitSales] = useState(0);
    const [revenue, setRevenue] = useState(0);
    const [topProduct, setTopProduct] = useState('');
    const [marketBasketData, setMarketBasketData] = useState({
        associationRules: [],
    });
    const [timeDistributionData, setTimeDistributionData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch people data
                const response = await supabase.from("peopledata").select("lastCount, Timestamp");
                const pay = await supabase.from("payments").select();

                // Payment analysis
                let cache = new Proxy({}, {
                    get: (target, name) => (name in target ? target[name] : 0)
                });

                pay.data.forEach((x) => {
                    x.cart.forEach((y) => {
                        cache[y.name] += y.quantity;
                    });
                });

                setPeopleData(response.data);
                setAttendanceData(cache);

                // Calculate unit sales
                const totalSales = pay.data.reduce((total, x) => total + x.cart.reduce((sum, y) => sum + y.quantity, 0), 0);
                setUnitSales(totalSales);

                // Calculate revenue
                const totalRevenueThisMonth = pay.data.reduce((total, x) => total + (x.price || 0), 0);
                setRevenue(totalRevenueThisMonth);

                // Determine the top product
                const productCounts = {};
                pay.data.forEach((x) => {
                    x.cart.forEach((y) => {
                        productCounts[y.name] = (productCounts[y.name] || 0) + y.quantity;
                    });
                });
                const topProductEntry = Object.entries(productCounts).reduce((max, entry) => (entry[1] > max[1] ? entry : max), ['', 0]);
                setTopProduct(topProductEntry[0]);

                // Fetch gender data
                const genderResponse = await supabase.from("analysis").select("Date, \"Total male\", \"Total Female\"");
                const aggregatedGenderData = {};

                // Aggregate data by date
                genderResponse.data.forEach((item) => {
                    const date = item.Date;
                    if (!aggregatedGenderData[date]) {
                        aggregatedGenderData[date] = { totalMale: 0, totalFemale: 0 };
                    }
                    aggregatedGenderData[date].totalMale += item["Total male"] || 0;
                    aggregatedGenderData[date].totalFemale += item["Total Female"] || 0;
                });

                // Convert the aggregated data into arrays for the chart
                const aggregatedDataArray = Object.entries(aggregatedGenderData).map(([date, counts]) => ({
                    date,
                    totalMale: counts.totalMale,
                    totalFemale: counts.totalFemale,
                }));

                setGenderData(aggregatedDataArray);

                // Market Basket Analysis
                const associationRules = calculateAssociationRules(pay.data, 0.1, 0.5); // Minimum support: 0.1, Minimum confidence: 50%
                setMarketBasketData({ associationRules });

                // Calculate time distribution
                calculateTimeDistribution(response.data);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const calculateFrequentItemSets = (transactions, minSupport) => {
        const itemCounts = {};
        transactions.forEach((transaction) => {
            const itemsInCart = transaction.cart.map(item => item.name);
            const uniqueItems = new Set(itemsInCart);
            uniqueItems.forEach(item => {
                itemCounts[item] = (itemCounts[item] || 0) + 1;
            });
        });

        return Object.entries(itemCounts)
            .filter(([item, count]) => count >= minSupport)
            .map(([item]) => item);
    };

    const calculateAssociationRules = (transactions, minSupport, minConfidence) => {
        const itemCounts = {};
        const itemPairCounts = {};
        const totalTransactions = transactions.length;

        // Count individual item occurrences
        transactions.forEach(transaction => {
            const itemsInCart = transaction.cart.map(item => item.name);
            const uniqueItems = new Set(itemsInCart);

            uniqueItems.forEach(item => {
                itemCounts[item] = (itemCounts[item] || 0) + 1;
            });

            // Count pairs of items
            uniqueItems.forEach(itemA => {
                uniqueItems.forEach(itemB => {
                    if (itemA !== itemB) {
                        const pairKey = [itemA, itemB].sort().join(',');
                        itemPairCounts[pairKey] = (itemPairCounts[pairKey] || 0) + 1;
                    }
                });
            });
        });

        // Generate rules
        const rules = [];
        for (const [pair, count] of Object.entries(itemPairCounts)) {
            const [itemA, itemB] = pair.split(',');
            const support = count / totalTransactions;
            const confidence = count / itemCounts[itemA]; // Confidence based on itemA
            const lift = confidence / (itemCounts[itemB] / totalTransactions); // Correct lift formula

            // Check if support and confidence meet the thresholds
            if (support >= minSupport && confidence <= 1) {
                rules.push({
                    rule: `${itemA} => ${itemB}`,
                    support: support,
                    confidence: confidence,
                    lift: lift,
                });
            }
        }
        return rules;
    };

    const calculateTimeDistribution = (data) => {
        const timeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };

        data.forEach(entry => {
            const hour = new Date(entry.Timestamp).getHours();
            if (hour >= 5 && hour < 12) {
                timeDistribution.morning += entry.lastCount;
            } else if (hour >= 12 && hour < 17) {
                timeDistribution.afternoon += entry.lastCount;
            } else if (hour >= 17 && hour < 21) {
                timeDistribution.evening += entry.lastCount;
            } else {
                timeDistribution.night += entry.lastCount;
            }
        });

        setTimeDistributionData(timeDistribution);
    };

    const peopleCountChartData = {
        labels: peopleData.map(x => x.Timestamp),
        datasets: [
            {
                label: 'People Count',
                data: peopleData.map((x) => x.lastCount),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const attendanceChartData = {
        labels: Object.keys(attendanceData),
        datasets: [
            {
                label: 'Product Count',
                data: Object.values(attendanceData),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    const genderChartData = {
        labels: genderData.map(data => data.date),
        datasets: [
            {
                label: 'Total Male',
                data: genderData.map(data => data.totalMale),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Total Female',
                data: genderData.map(data => data.totalFemale),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const timeChartData = {
        labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
        datasets: [
            {
                label: 'Population Distribution by Time of Day',
                data: [
                    timeDistributionData.morning,
                    timeDistributionData.afternoon,
                    timeDistributionData.evening,
                    timeDistributionData.night,
                ],
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <Container fluid className="dashboard-container d-flex flex-column" style={{ minHeight: '100vh' }}>
            <h2 className="text-center my-4">Admin Dashboard</h2>
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="text-center shadow-sm" style={{ borderRadius: '10px' }}>
                        <Card.Body>
                            <Card.Title>Unit Sales This Month</Card.Title>
                            <Card.Text style={{ fontSize: '2rem', fontWeight: 'bold' }}>{unitSales}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center shadow-sm" style={{ borderRadius: '10px' }}>
                        <Card.Body>
                            <Card.Title>Revenue This Month</Card.Title>
                            <Card.Text style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{revenue.toFixed(2)}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center shadow-sm" style={{ borderRadius: '10px' }}>
                        <Card.Body>
                            <Card.Title>Top Product</Card.Title>
                            <Card.Text style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{topProduct}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <hr />
            {peopleData.length > 0 && (
                <Row>
                    <Col md={6} className="mb-4">
                        <Card className="mt-4 shadow-sm" style={{ borderRadius: '10px' }}>
                            <Card.Body>
                                <Card.Title>People Count Over Time</Card.Title>
                                <Bar data={peopleCountChartData} options={{ responsive: true, maintainAspectRatio: true }} height={250} />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} className="mb-4">
                        <Card className="mt-4 shadow-sm" style={{ borderRadius: '10px' }}>
                            <Card.Body>
                                <Card.Title>Product Data</Card.Title>
                                <Bar data={attendanceChartData} options={{ responsive: true, maintainAspectRatio: true }} height={250} />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} className="mb-4">
                        <Card className="mt-4 shadow-sm" style={{ borderRadius: '10px' }}>
                            <Card.Body>
                                <Card.Title>Gender Distribution</Card.Title>
                                <Bar data={genderChartData} options={{ responsive: true, maintainAspectRatio: true }} height={250} />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} className="mb-4">
                        <Card className="mt-4 shadow-sm" style={{ borderRadius: '10px' }}>
                            <Card.Body>
                                <Card.Title>Population Distribution by Time of Day</Card.Title>
                                <Pie data={timeChartData} options={{ responsive: true, maintainAspectRatio: true }} height={250} />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
            {marketBasketData.associationRules.length > 0 && (
                <Card className="mt-4 shadow-sm" style={{ borderRadius: '10px' }}>
                    <Card.Body>
                        <Card.Title>Market Basket Analysis - Association Rules</Card.Title>
                        <ul className="list-unstyled">
                            {marketBasketData.associationRules.map((rule, index) => (
                                <li key={index} className="border-bottom py-2">
                                    {rule.rule} (Support: {(rule.support * 100).toFixed(2)}%, Confidence: {(rule.confidence * 100).toFixed(2)}%, Lift: {rule.lift.toFixed(2)})
                                </li>
                            ))}
                        </ul>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default Dashboard;
