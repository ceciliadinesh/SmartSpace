import React, { useState, useRef } from 'react';
import { Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

const CameraInterface = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [peopleCount, setPeopleCount] = useState(0);
  const [lastCount, setLastCount] = useState(null);
  const [timestamp, setTimestamp] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const handleStartCamera = async () => {
    setShowCamera(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    mediaStreamRef.current = stream;
    videoRef.current.srcObject = stream;

    videoRef.current.onloadedmetadata = () => {
      videoRef.current.play();
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      const modelPromise = cocoSsd.load();
      modelPromise.then(model => {
        detectObjects(model);
      });
    };
  };

  const handleStopCamera = () => {
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
    
    // Update last count and timestamp when stopping the camera
    setLastCount(peopleCount);
    setTimestamp(new Date().toLocaleString());
    setPeopleCount(0); // Reset current count
  };

  const detectObjects = (model) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const detect = async () => {
      if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
        const predictions = await model.detect(video);
        const peoplePredictions = predictions.filter(p => p.class === 'person');
        setPeopleCount(peoplePredictions.length);
        drawBoxes(canvas.getContext('2d'), video, peoplePredictions);
      }
      requestAnimationFrame(() => detect());
    };

    detect();
  };

  const drawBoxes = (context, video, predictions) => {
    if (!context || !canvasRef.current) return;
    context.clearRect(0, 0, video.videoWidth, video.videoHeight);
    context.strokeStyle = 'green';
    context.lineWidth = 2;

    const scaleX = canvasRef.current.width / video.videoWidth;
    const scaleY = canvasRef.current.height / video.videoHeight;

    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;
      context.strokeRect(x * scaleX, y * scaleY, width * scaleX, height * scaleY);
    });
  };

  return (
    <div className="camera-container d-flex flex-column align-items-center" style={{ minHeight: '100vh' }}>
      <h2 className="mb-4">Webcam People Counting</h2>
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
                id="videoElement"
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
                  height: '100%'
                }}
              />
            </Card.Body>
          </Card>
        </div>
      )}

      <h4>Current People Count: {peopleCount}</h4>
      {!showCamera && lastCount !== null && (
        <h4>
          Last Count: {lastCount} at {timestamp}
        </h4>
      )}
    </div>
  );
};

export default CameraInterface;
