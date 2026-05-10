const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Temporary chat endpoint (we'll add real AI later)
app.post('/api/chat/send', (req, res) => {
    const { message, sessionId, userId } = req.body;
    
    console.log(`Message from ${userId}: ${message}`);
    
    // Simple responses (replace with real AI later)
    let reply = `I received: "${message}". I'm NOVA AI. Soon I'll have full intelligence! 🚀`;
    
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        reply = "Hello! Nice to meet you! I'm NOVA, your AI assistant. How can I help today? ✨";
    } else if (message.toLowerCase().includes('how are you')) {
        reply = "I'm functioning perfectly! Ready to assist you with any task. 😊";
    } else if (message.toLowerCase().includes('help')) {
        reply = "I can help with: answering questions, remembering our conversations, and soon - image generation, coding, and web search!";
    }
    
    res.json({ 
        message: reply,
        messageId: Date.now().toString(),
        toolsUsed: []
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ NOVA server running on http://localhost:${PORT}`);
    console.log(`🌐 Frontend should connect to: http://localhost:${PORT}`);
});