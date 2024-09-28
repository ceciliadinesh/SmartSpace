// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage'; 
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import CameraInterface from './pages/CameraInterface';
import QRScanner from './pages/QRScanner';
import Checkout from './pages/Checkout';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import './App.css'; 

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Navbar onLogout={handleLogout} /> 
      <div className="container">
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          {/* Protect the routes that need authentication */}
          <Route path="/home" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/camera-interface" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CameraInterface />
            </ProtectedRoute>
          } />
          <Route path="/qr-scanner" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <QRScanner />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Checkout />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
