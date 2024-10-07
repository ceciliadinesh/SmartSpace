import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const QRScanner = () => {
  const [scannedData, setScannedData] = useState('');
  const [cart, setCart] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProductScanned, setIsProductScanned] = useState(false);
  const navigate = useNavigate();
  let qrScanner = null;

  useEffect(() => {
    const loadHtml5QrCode = async () => {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      qrScanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10,
      });

      qrScanner.render(
        (result) => {
          if (!isProductScanned) {
            handleScan(result);
          }
        },
        (err) => {
          console.error('QR Scanner Error:', err);
        }
      );
    };

    loadHtml5QrCode();

    return () => {
      if (qrScanner) {
        qrScanner.clear();
      }
    };
  }, [isProductScanned]);

  const handleScan = (data) => {
    if (data) {
      const productInfo = parseProductData(data);
      if (productInfo) {
        addProductToCart(productInfo);
      } else {
        setErrorMessage('Invalid QR data format. Please scan again.');
      }
    }
  };

  const addProductToCart = (productInfo) => {
    const existingProductIndex = cart.findIndex(item => item.name === productInfo.name);
    
    if (existingProductIndex >= 0) {
      setErrorMessage('This product is already in the cart. Please scan a different product.');
    } else {
      const newCart = [...cart, { name: productInfo.name, price: productInfo.price, quantity: 1 }];
      setCart(newCart);
      setScannedData(productInfo.name);
      setErrorMessage('');
      setIsProductScanned(true);

      setTimeout(() => {
        setIsProductScanned(false);
      }, 1000);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { cart, totalPrice: calculateTotalPrice() } });
  };

  const handleRemoveFromCart = (productName) => {
    setCart((prevCart) => prevCart.filter(item => item.name !== productName));
  };

  const increaseQuantity = (productName) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.name === productName) {
          return { ...item, quantity: item.quantity + 1 }; // Create a new object with updated quantity
        }
        return item;
      });
    });
  };
  
  const decreaseQuantity = (productName) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.name === productName && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 }; // Create a new object with updated quantity
        }
        return item;
      });
    });
  };
  

  const parseProductData = (data) => {
    try {
      const productData = data.split(';');
      if (productData.length === 2) {
        const name = productData[0].split(':')[1].trim();
        const price = parseFloat(productData[1].split(':')[1].trim());
        return { name, price };
      } else {
        throw new Error('Incorrect data format');
      }
    } catch (err) {
      console.error('Error parsing data:', err);
      return null;
    }
  };

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <div className="qr-scanner-container d-flex flex-column align-items-center" style={{ minHeight: '100vh' }}>
      <h2 className="mb-4">QR Scanner</h2>
      <div id="reader" style={{ width: '100%', maxWidth: '600px', marginTop: '20px' }}></div>

      {scannedData && (
        <Alert variant="success" className="mt-3">Scanned: {scannedData}</Alert>
      )}

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Card className="shadow mb-4" style={{ width: '100%', maxWidth: '600px' }}>
        <Card.Body>
          <Card.Title>Cart</Card.Title>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price (₹)</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.length > 0 ? (
                cart.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>₹{item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <Button variant="primary" onClick={() => increaseQuantity(item.name)}>+</Button>
                      <Button variant="secondary" onClick={() => decreaseQuantity(item.name)} className="mx-2" disabled={item.quantity <= 1}>-</Button>
                      <Button variant="danger" onClick={() => handleRemoveFromCart(item.name)} className="ml-2">Remove</Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No items in cart.</td>
                </tr>
              )}
            </tbody>
          </Table>
          <h5 className="mt-3">Total: ₹{calculateTotalPrice()}</h5>
          <Button variant="success" className="mt-3" onClick={handleCheckout} disabled={cart.length === 0}>Checkout</Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default QRScanner;
