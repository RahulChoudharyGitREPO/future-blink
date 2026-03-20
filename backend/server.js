const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const Flow = require('./models/Flow');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Validate required environment variables on startup
if (!process.env.OPENROUTER_API_KEY) {
  console.error('FATAL ERROR: OPENROUTER_API_KEY environment variable is missing.');
  process.exit(1);
}

const AI_CONFIG = {
  url: 'https://openrouter.ai/api/v1/chat/completions',
  key: process.env.OPENROUTER_API_KEY,
  // The mistral free model was removed by OpenRouter (returns 404). Using a working free alternative:
  model: 'google/gemma-3-12b-it:free',
};

console.log(`AI Provider: OpenRouter (${AI_CONFIG.model})`);

// POST /api/ask-ai — Call AI provider and return response
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await axios.post(
      AI_CONFIG.url,
      {
        model: AI_CONFIG.model,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${AI_CONFIG.key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'AI Flow App',
        },
        timeout: 30000,
      }
    );

    // Safer response parsing to prevent crashes if response format changes
    const aiResponse = 
      response?.data?.choices?.[0]?.message?.content || 
      'Received an empty or invalid response from the AI model.';
      
    res.json({ response: aiResponse });
  } catch (err) {
    console.error('AI error:', err.response?.data || err.message);
    const status = err.response?.status || 500;
    
    // Pass the actual OpenRouter error message to the frontend if available
    const openRouterMsg = err.response?.data?.error?.message;
    const errorMsg = openRouterMsg 
      ? openRouterMsg 
      : status === 429
        ? 'Model is rate-limited. Please wait a moment and try again.'
        : 'Failed to get AI response';
        
    res.status(status).json({ error: errorMsg });
  }
});

// POST /api/save — Save prompt + response to MongoDB
app.post('/api/save', async (req, res) => {
  try {
    const { prompt, response } = req.body;

    if (!prompt || !response) {
      return res.status(400).json({ error: 'Prompt and response are required' });
    }

    const flow = await Flow.create({ prompt, response });
    res.status(201).json(flow);
  } catch (err) {
    console.error('Save error:', err.message);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
