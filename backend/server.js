const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); // For environment variables

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Body parser for handling JSON data

// MongoDB connection
const mongoURI = process.env.MONGO_URI  // Update Mongo URI
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a schema for detection data
const DetectionSchema = new mongoose.Schema({
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  emotion: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Detection = mongoose.model('Detection', DetectionSchema);

// API endpoint to store detection data
app.post('/api/detections', async (req, res) => {
  try {
    const detections = await Detection.insertMany(req.body); // insertMany expects an array of detections
    res.status(200).json(detections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving detection data', error: err });
  }
});

// API endpoint to get detection data
app.get('/api/detections', async (req, res) => {
  try {
    const detections = await Detection.find({});
    res.status(200).json(detections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching detection data', error: err });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
