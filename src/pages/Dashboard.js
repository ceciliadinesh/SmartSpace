import React, { useState, useEffect } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import supabase from '../components/database';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [peopleData, setPeopleData] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [genderData, setGenderData] = useState([]);
    const [unitSales, setUnitSales] = useState(0);
    const [revenue, setRevenue] = useState(0);
    const [topProduct, setTopProduct] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch people data
                const response = await supabase.from("peopledata").select("lastCount, Timestamp");
                const pay = await (await supabase.from("payments").select()).data;
                let cache = new Proxy({}, {
                    get: (target, name) => (name in target ? target[name] : 0)
                });

                pay.forEach((x) => {
                    x.cart.forEach((y) => {
                        cache[y.name] += y.quantity;
                    });
                });

                setPeopleData(response.data);
                setAttendanceData(cache);

                // Calculate unit sales
                const totalSales = pay.reduce((total, x) => total + x.cart.reduce((sum, y) => sum + y.quantity, 0), 0);
                setUnitSales(totalSales);

                // Determine the start and end dates for the current month
                const today = new Date();
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the month
                const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the month

                // Calculate revenue for this month
                const totalRevenueThisMonth = pay.reduce((total, x) => {
                    const paymentDate = new Date(x.PaymentDate); // Use the PaymentDate field
                    // Check if the payment date is within the current month
                    if (paymentDate >= firstDayOfMonth && paymentDate <= lastDayOfMonth) {
                        return total + (x.price || 0); // Sum the price field
                    }
                    return total;
                }, 0);
                setRevenue(totalRevenueThisMonth);

                // Determine the top product
                const productCounts = {};
                pay.forEach((x) => {
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
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

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

    return (
        <div className="dashboard-container d-flex flex-column align-items-center" style={{ minHeight: '100vh' }}>
            <h2 className="mb-4">Admin Dashboard</h2>
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Unit Sales This Month</Card.Title>
                            <Card.Text>{unitSales}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Revenue This Month</Card.Title>
                            <Card.Text>₹{revenue.toFixed(2)}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Top Product</Card.Title>
                            <Card.Text>{topProduct}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <hr />
            {peopleData.length > 0 && (
                <>
                    <Card className="mt-4" style={{ width: '100%', maxWidth: '600px' }}>
                        <Card.Body>
                            <h5 className="mb-4">People Count Over the Week</h5>
                            <Bar data={peopleCountChartData} />
                        </Card.Body>
                    </Card>
                    <Card className="mt-4" style={{ width: '100%', maxWidth: '600px' }}>
                        <Card.Body>
                            <h5 className="mb-4">Sales Over the Week</h5>
                            <Bar data={attendanceChartData} />
                        </Card.Body>
                    </Card>
                    <Card className="mt-4" style={{ width: '100%', maxWidth: '600px' }}>
                        <Card.Body>
                            <h5 className="mb-4">Total Male and Female Count Over Time</h5>
                            <Bar data={genderChartData} />
                        </Card.Body>
                    </Card>
                </>
            )}
        </div>
    );
};

export default Dashboard;
