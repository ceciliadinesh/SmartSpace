// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const predefinedAdmin = {
  username: 'admin',
  password: 'admin123'
};

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === predefinedAdmin.username && password === predefinedAdmin.password) {
      onLogin();
      navigate('/home');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', padding: '0' }}>
      <Card className="shadow" style={{ width: '400px', margin: 'auto' }}>
        <Card.Body>
          <Card.Title className="text-center" style={{ fontSize: '1.5em' }}>Admin Login</Card.Title>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" onClick={handleLogin} className="w-100">
              Login
            </Button>
          </Form>
          {error && <p className="text-danger text-center mt-2">{error}</p>}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
