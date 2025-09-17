const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the model specified in environment variables (e.g., "gemini-pro")
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

module.exports = {
  genAI,
  model
};