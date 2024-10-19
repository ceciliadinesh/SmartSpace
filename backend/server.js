// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample response data
const responses = {
    "What were the sales today?": "Today's sales were $1000.",
    "What is the store's opening time?": "The store opens at 9 AM.",
    "What products are on sale?": "We have discounts on electronics this week.",
};

// Endpoint for the chatbot
app.post('/api/chat', (req, res) => {
    const userMessage = req.body.message;
    const botResponse = responses[userMessage] || "I'm sorry, I didn't understand that.";
    res.json({ response: botResponse });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
