require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve frontend static files from client folder
app.use(express.static(path.join(__dirname, 'client')));

// Your existing weather API route
app.get('/api/weather', async (req, res) => {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'City is required' });

    try {
        const response = await axios.get(
            `http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${city}&days=3&aqi=no&alerts=no`
        );
        res.json(response.data);
    } catch (error) {
        console.error('API error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// For any other routes, serve the frontend index.html (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
