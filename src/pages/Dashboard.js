import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'; // Import necessary components
import 'bootstrap/dist/css/bootstrap.min.css';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [peopleData, setPeopleData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/people-data'); // Replace with your API endpoint
                const data = await response.json();
                setPeopleData(data.peopleCount); 
                setAttendanceData(data.attendanceCount); 
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const peopleCountChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'People Count',
                data: peopleData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const attendanceChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Attendance Count',
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
            
            <Card className="mt-4" style={{ width: '100%', maxWidth: '600px' }}>
                <Card.Body>
                    <h5 className="mb-4">People Count Over the Week</h5>
                    <Bar data={peopleCountChartData} />
                </Card.Body>
            </Card>

            <Card className="mt-4" style={{ width: '100%', maxWidth: '600px' }}>
                <Card.Body>
                    <h5 className="mb-4">Attendance Count Over the Week</h5>
                    <Bar data={attendanceChartData} />
                </Card.Body>
            </Card>
        </div>
    );
};

export default Dashboard;
