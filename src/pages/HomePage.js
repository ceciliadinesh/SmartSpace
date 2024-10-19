import React, { useState, useEffect, useRef } from 'react';
import './HomePage.css'; // Import the updated styles
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [clickedFeature, setClickedFeature] = useState(null);
  const [inView, setInView] = useState(Array(4).fill(false)); // Array to track visibility of each feature
  const featureRefs = useRef([]);
  const textRefs = useRef([]); // Array of refs for text elements
  const [textInView, setTextInView] = useState(false); // Track visibility of the text

  const handleClick = (featureId) => {
    setClickedFeature(featureId);
    setTimeout(() => {
      setClickedFeature(null);
    }, 1000); // Reset clicked feature after 1 second
  };

  const features = [
    {
      id: 1,
      title: 'Real-Time People Counting',
      description: 'Accurately track the number of people in real-time.',
      image: require('../images/feature1.jpg'),
      link: '/camera-interface',
    },
    {
      id: 2,
      title: 'QR Scanner',
      description: 'Scan QR codes using the camera to quickly add items to the cart effortlessly.',
      image: require('../images/feature2.jpg'), // Make sure to provide the correct image path
      link: '/qr-scanner',
    },
    {
      id: 3,
      title: 'People analysis',
      description: 'Analyze people by tracking their age group, emotions, and gender for comprehensive analysis.',
      image: require('../images/feature3.jpg'), // Ensure to provide the correct image path
      link: '/people-analysis',
    },
    {
      id: 4,
      title: 'Attendance via Face Recognition',
      description: 'Streamline attendance management with facial recognition.',
      image: require('../images/feature4.jpg'),
      link: '/face-recognition',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setInView((prev) => {
            const newInView = [...prev];
            newInView[index] = true; // Set this feature as in view
            return newInView;
          });
          observer.unobserve(entry.target); // Stop observing after it's in view
        }
      });
    });

    featureRefs.current.forEach((feature) => {
      if (feature) observer.observe(feature);
    });

    // Observer for the text sections
    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTextInView(true); // Set text as in view
          textObserver.unobserve(entry.target); // Stop observing after it's in view
        }
      });
    });

    textRefs.current.forEach((text) => {
      if (text) textObserver.observe(text);
    });

    return () => {
      featureRefs.current.forEach((feature) => {
        if (feature) observer.unobserve(feature);
      });
      textRefs.current.forEach((text) => {
        if (text) textObserver.unobserve(text); // Clean up observer
      });
    };
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-container">
        <video className="hero-video" autoPlay loop muted>
          <source src={require('../images/supermarket.mp4')} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Add ref to text elements */}
        <h1 ref={(el) => (textRefs.current[0] = el)} className={`text-section ${textInView ? 'in-view' : ''}`}>
          Welcome to SmartSpace Analytics
        </h1>
        <p ref={(el) => (textRefs.current[1] = el)} className={`text-section ${textInView ? 'in-view' : ''}`}>
          An Innovative Analysis of Your Business
        </p>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Our Features</h2>

        {features.map((feature, index) => (
          <div
            key={feature.id}
            ref={(el) => (featureRefs.current[index] = el)} // Reference for Intersection Observer
            className={`feature-row ${index % 2 === 0 ? '' : 'reverse'} ${clickedFeature === feature.id ? 'clicked' : ''} ${inView[index] ? 'in-view' : ''}`} // Add 'in-view' class when feature is in view
            onClick={() => handleClick(feature.id)}
          >
            <div className="feature-image">
              <img src={feature.image} alt={feature.title} />
            </div>
            <div className="feature-description">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link to={feature.link}>
                <button className="btn">Learn More</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
