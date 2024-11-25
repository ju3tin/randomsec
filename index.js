const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// ** API 1: Needs Access Token and CORS **
// CORS configuration: Allow requests only from your specific URL
const allowedOrigin = process.env.ALLOWED_ORIGIN;


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a schema for the collection
const numberSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Auto-incremented ID
    value: { type: Number, required: true },           // The number to store
});

// Create a model
const NumberEntry = mongoose.model('NumberEntry', numberSchema);

// Endpoint to add a number and increment an ID
app.post('/add-number', async (req, res) => {
    try {
        // Get the current highest ID
        const lastEntry = await NumberEntry.findOne().sort({ id: -1 });
        const nextId = lastEntry ? lastEntry.id + 1 : 1; // Increment ID or start from 1

        // Create a new entry with the incremented ID
        const newEntry = new NumberEntry({
            id: nextId,
            value: req.body.value,
        });

        // Save the entry to the database
        await newEntry.save();

        res.status(201).json({ message: 'Number added successfully', data: newEntry });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add number' });
    }
});


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

app.get('/', (req, res) => {
    const randomTime = generateRandomTime();
    res.json({ "message":"hello world" });
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