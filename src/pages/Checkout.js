import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import QRious from 'qrious';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize navigate
  const { cart = [], totalPrice = 0 } = location.state || { cart: [], totalPrice: 0 };
  const [paymentDetails, setPaymentDetails] = useState({ name: '', cardNumber: '', expiry: '', cvv: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGPayScanned, setIsGPayScanned] = useState(false);

  useEffect(() => {
    if (totalPrice > 0) {
      const gPayLink = generateGPayLink();
      const qr = new QRious({
        value: gPayLink,
        size: 128,
      });
      setQrCodeUrl(qr.toDataURL());
      setIsGPayScanned(false);
    }
  }, [totalPrice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentDetails.name || !paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvv) {
      setErrorMessage('Please fill in all payment details.');
      return;
    }
    setSuccessMessage('Payment successful!');
    setErrorMessage('');
    
    // Redirect to home after payment
    navigate('/'); // Redirect to home
  };

  const handleGPay = () => {
    if (isGPayScanned) {
      setSuccessMessage('GPay payment successful!');
      setErrorMessage('');
      
      // Redirect to home after GPay payment
      navigate('/'); // Redirect to home
    } else {
      setErrorMessage('Please scan the QR code before proceeding with GPay payment.');
    }
  };

  const generateGPayLink = () => {
    return `upi://pay?pa=cecilia14062004@okaxis&pn=Cecilia%20Name&mc=1234&tid=transactionId&am=${totalPrice}&cu=INR&tn=Payment%20for%20Order`;
  };

  const simulateQRCodeScan = () => {
    setIsGPayScanned(true);
    setSuccessMessage('QR code scanned successfully! You can now proceed with payment.');
    setErrorMessage('');
  };

  return (
    <div className="checkout-container d-flex flex-column align-items-center" style={{ minHeight: '100vh' }}>
      <h2 className="mb-4">Checkout</h2>
      <Card className="shadow mb-4" style={{ width: '100%', maxWidth: '600px' }}>
        <Card.Body>
          <Card.Title>Cart Summary</Card.Title>
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <div key={index}>
                <span>{item.name} - ₹{item.price.toFixed(2)} x {item.quantity}</span>
              </div>
            ))
          ) : (
            <div>No items in cart.</div>
          )}
          <h5 className="mt-3">Total: ₹{parseFloat(totalPrice).toFixed(2)}</h5>

          <Form onSubmit={handlePaymentSubmit} className="mt-4">
            <Form.Group controlId="formName">
              <Form.Label>Name on Card</Form.Label>
              <Form.Control type="text" placeholder="Enter name" name="name" value={paymentDetails.name} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formCardNumber">
              <Form.Label>Card Number</Form.Label>
              <Form.Control type="text" placeholder="Enter card number" name="cardNumber" value={paymentDetails.cardNumber} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formExpiry">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control type="text" placeholder="MM/YY" name="expiry" value={paymentDetails.expiry} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formCvv">
              <Form.Label>CVV</Form.Label>
              <Form.Control type="text" placeholder="CVV" name="cvv" value={paymentDetails.cvv} onChange={handleInputChange} />
            </Form.Group>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Button variant="success" className="mt-3" type="submit" disabled={cart.length === 0}>
              Confirm Purchase
            </Button>
          </Form>

          <div className="mt-4">
            <h5>Pay with Google Pay</h5>
            {qrCodeUrl && <img src={qrCodeUrl} alt="GPay QR Code" />}
            <Button variant="primary" className="mt-3" onClick={simulateQRCodeScan} disabled={cart.length === 0}>
              Simulate QR Code Scan
            </Button>
            <Button variant="primary" className="mt-3" onClick={handleGPay} disabled={cart.length === 0}>
              Confirm GPay Payment
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Checkout;
