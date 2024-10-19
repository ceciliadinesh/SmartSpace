import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'; // Import necessary components
import 'bootstrap/dist/css/bootstrap.min.css';
import supabase from '../components/database';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [peopleData, setPeopleData] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await supabase.from("peopledata").select("lastCount,Timestamp") // Replace with your API endpoint
                const pay=await (await supabase.from("payments").select()).data
                let cache= new Proxy({}, {
                    get: (target, name) => name in target ? target[name] : 0
                  })

                pay.forEach((x)=>{
                    x.cart.forEach((y)=>{
                        cache[y.name]+=y.quantity
                    })
                })

                console.log(pay,cache)
                console.log(response)
                setPeopleData(response.data); 
                setAttendanceData(cache); 
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const peopleCountChartData = {
        labels: peopleData.map(x=>x.Timestamp),
        datasets: [
            {
                label: 'People Count',
                data: peopleData.map((x)=>x.lastCount),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const attendanceChartData = {
        
        datasets: [
            {
                label: 'Product Count',
                data: attendanceData,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="dashboard-container d-flex flex-column align-items-center" style={{ minHeight: '100vh' }}>
            <h2 className="mb-4">Admin Dashboard</h2>
           { peopleData?( <><Card className="mt-4" style={{ width: '100%', maxWidth: '600px' }}>
                <Card.Body>
                    <h5 className="mb-4">People Count Over the Week</h5>
                    <Bar data={peopleCountChartData} />
                </Card.Body>
            </Card><Card className="mt-4" style={{ width: '100%', maxWidth: '600px' }}>
                    <Card.Body>
                        <h5 className="mb-4">Sales Over the Week</h5>
                        <Bar data={attendanceChartData} />
                    </Card.Body>
                </Card></>):""}
           
        </div>
    );
};

export default Dashboard;
