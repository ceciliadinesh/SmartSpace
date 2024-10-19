import React, { useState, useRef } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';

const GenerateQRCode = () => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const qrCodeRef = useRef(); // Reference for the QR code canvas

  const handleSubmit = (e) => {
    e.preventDefault();
    // Format the data as expected for the QR code
    const data = `name: ${productName}; price: ${productPrice}`;
    setQrCodeData(data);
  };

  const handleDownload = () => {
    const canvas = qrCodeRef.current.querySelector('canvas'); // Get the canvas element
    if (canvas) {
      const imageUrl = canvas.toDataURL('image/png'); // Convert the canvas to data URL
      const link = document.createElement('a'); // Create an anchor element
      link.href = imageUrl; // Set the href to the image URL
      link.download = `${productName}_QRCode.png`; // Set the download attribute
      document.body.appendChild(link); // Append link to the body
      link.click(); // Simulate click to trigger download
      document.body.removeChild(link); // Remove the link after download
    }
  };

  return (
    <div
      className="generate-qr-container d-flex flex-column align-items-center"
      style={{
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1
        className="mb-4"
        style={{ color: '#28a745', fontSize: '36px', textAlign: 'center' }}
      >
        QR Code Generator
      </h1>
      <p
        className="mb-4"
        style={{
          fontSize: '18px',
          maxWidth: '600px',
          textAlign: 'center',
          margin: '0 auto 30px',
        }}
      >
        Create a QR code for your product. Simply enter the product name and
        price, and click on "Generate QR Code" to see your QR code.
      </p>
      <Card
        className="shadow mb-4"
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
                required
                style={{
                  border: '2px solid #28a745',
                  borderRadius: '5px',
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Product Price</Form.Label>
              <Form.Control
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="Enter product price"
                required
                style={{
                  border: '2px solid #28a745',
                  borderRadius: '5px',
                }}
              />
            </Form.Group>
            <Button
              variant="success"
              type="submit"
              style={{
                width: '100%',
                borderRadius: '5px',
                padding: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
              }}
            >
              Generate QR Code
            </Button>
          </Form>

          {qrCodeData && (
            <div className="mt-4 text-center" ref={qrCodeRef}>
              <h5>Your QR Code:</h5>
              <QRCodeCanvas
                value={qrCodeData}
                size={256}
                style={{ margin: '20px auto', border: '1px solid #28a745', borderRadius: '10px' }}
              />
              <div className="d-flex justify-content-center mt-3">
                <Button
                  variant="primary"
                  onClick={handleDownload}
                  style={{
                    marginRight: '10px',
                    borderRadius: '5px',
                    padding: '10px 20px',
                    fontSize: '16px',
                  }}
                >
                  Download QR Code
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setQrCodeData('')}
                  style={{
                    borderRadius: '5px',
                    padding: '10px 20px',
                    fontSize: '16px',
                  }}
                >
                  Generate Another QR Code
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default GenerateQRCode;
