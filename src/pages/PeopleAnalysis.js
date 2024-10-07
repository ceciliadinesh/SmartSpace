import React, { useState, useRef } from 'react';
import { Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as faceapi from '@vladmandic/face-api';

const PeopleAnalysis = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [mood, setMood] = useState('Neutral'); // Store detected mood
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [isPersonDetected, setIsPersonDetected] = useState(false);
  const [collectedData, setCollectedData] = useState([]); // Store detected data

  const handleStartCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      mediaStreamRef.current = stream;
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = async () => {
        videoRef.current.play();
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        try {
          // Load face-api models
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.ageGenderNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models'), // Load expression model
          ]);
          detectFaces();
        } catch (error) {
          console.error('Error loading models:', error);
        }
      };
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  };

  const handleStopCamera = () => {
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
    setIsPersonDetected(false);

    // Send collected data to backend when camera stops
    if (collectedData.length > 0) {
      saveDataToBackend(collectedData);
    }

    setMood('UNKNOWN');
  };

  const detectFaces = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const detect = async () => {
      if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withAgeAndGender()
          .withFaceExpressions();

        drawBoxes(canvas.getContext('2d'), video, detections);
      }
      requestAnimationFrame(detect);
    };

    detect();
  };

  const drawBoxes = (context, video, detections) => {
    if (!context || !canvasRef.current) return;

    context.clearRect(0, 0, video.videoWidth, video.videoHeight);
    context.strokeStyle = 'red';
    context.lineWidth = 2;

    const scaleX = canvasRef.current.width / video.videoWidth;
    const scaleY = canvasRef.current.height / video.videoHeight;

    let detectedThisFrame = false;
    let newMood = 'UNKNOWN';

    detections.forEach(detection => {
      const { x, y, width, height } = detection.detection.box;
      context.strokeRect(x * scaleX, y * scaleY, width * scaleX, height * scaleY);

      const age = Math.round(detection.age);
      const gender = detection.gender === 'male' ? 'MALE' : 'FEMALE';
      const expressions = detection.expressions;

      if (expressions) {
        newMood = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        ).toUpperCase();
      }

      detectedThisFrame = true;
      setIsPersonDetected(true); // Update the detection state

      // Collect data
      setCollectedData(prevData => [
        ...prevData,
        {
          age: age,
          gender: gender,
          emotion: newMood,
          timestamp: new Date().toISOString(),
        },
      ]);

      const boxWidth = 250;
      const boxHeight = 100;
      const boxX = x * scaleX + width * scaleX + 10;
      const boxY = y * scaleY;

      context.fillStyle = 'rgba(255, 255, 255, 0.7)';
      context.fillRect(boxX, boxY, boxWidth, boxHeight);

      context.fillStyle = 'black';
      context.font = '16px Arial';
      context.fillText(`AGE: ${age}`, boxX + 5, boxY + 20);
      context.fillText(`GENDER: ${gender}`, boxX + 5, boxY + 40);
      context.fillText(`EMOTION: ${newMood}`, boxX + 5, boxY + 60);
    });

    setMood(newMood);

    if (!detectedThisFrame) {
      if (isPersonDetected) {
        setIsPersonDetected(false);
        setMood('UNKNOWN');
      }
    }
  };

  const saveDataToBackend = async (data) => {
    console.log('Sending data to backend:', data); // Log the data for debugging
    try {
      const response = await fetch('http://localhost:5001/api/detections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Data saved successfully');
      } else {
        console.error('Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  return (
    <div className="camera-container d-flex flex-column align-items-center" style={{ minHeight: '100vh' }}>
      <h2 className="mb-4">Webcam People Analysis</h2>
      <Card className="shadow" style={{ width: '100%', maxWidth: '600px' }}>
        <Card.Body>
          {showCamera ? (
            <Button variant="danger" onClick={handleStopCamera}>
              Stop Camera
            </Button>
          ) : (
            <Button variant="primary" onClick={handleStartCamera}>
              Start Camera
            </Button>
          )}
        </Card.Body>
      </Card>

      {showCamera && (
        <div className="video-stream mt-4" style={{ position: 'relative' }}>
          <Card className="shadow">
            <Card.Body>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1,
                  width: '100%',
                  height: '100%',
                }}
              />
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PeopleAnalysis;