const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route (we'll add more later)
app.get('/', (req, res) => {
    res.json({ message: 'NOVA AI Server is running!' });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ NOVA server running on http://localhost:${PORT}`);
    console.log(`📡 Test it at: http://localhost:${PORT}/health`);
});