const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// ** API 1: Needs Access Token and CORS **
// CORS configuration: Allow requests only from your specific URL
const allowedOrigin = process.env.ALLOWED_ORIGIN;
app.use('/secure-api', cors({
    origin: (origin, callback) => {
        if (!origin || origin === allowedOrigin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// Middleware to check access token for secure API
app.use('/secure-api', (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === `Bearer ${process.env.ACCESS_TOKEN}`) {
        next(); // Token is valid, proceed to the endpoint
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// Secure API endpoint
app.get('/secure-api/random-time', (req, res) => {
    const randomTime = generateRandomTime();
    res.json({ randomTime });
});

// ** API 2: Open to Everyone **
// Open API endpoint
app.get('/open-api/random-time', (req, res) => {
    const randomTime = generateRandomTime();
    res.json({ randomTime });
});

// Random time generator function
function generateRandomTime() {
    const randomMilliseconds = Math.random() * (5999 - 10 + 1) + 10; // 10ms to 5999ms
    return parseFloat((randomMilliseconds / 100).toFixed(2)); // Convert to seconds
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});