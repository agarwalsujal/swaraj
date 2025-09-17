const { model } = require('../config/geminiAI');
const Log = require('../models/logModel');
const Subscription = require('../models/subscriptionModel');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

exports.processQuery = async (req, res) => {
  try {
    const { query, options = {} } = req.body;

    // Process query with Gemini
    const geminiOptions = {
      temperature: options.temperature || 0.7,
      topP: options.topP,
      topK: options.topK,
      maxOutputTokens: options.maxTokens || 1024,
      ...options
    };

    const result = await model.generateContent(query, geminiOptions);
    const response = await result.response;
    const text = response.text();

    // Log the query
    await Log.create({
      userId: req.user.id,
      type: 'ai_query',
      message: query,
      metadata: {
        response: {
          text: text,
          candidates: response.candidates?.map(c => ({
            content: c.content,
            finishReason: c.finishReason
          }))
        },
        options: geminiOptions
      }
    });

    // Update quota usage
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id, status: 'active' }
    });

    if (subscription && subscription.monthlyQuota !== -1) {
      subscription.quotaUsed += 1;
      await subscription.save();
    }

    res.json({
      success: true,
      result: text
    });
  } catch (error) {
    // Log error
    await Log.create({
      userId: req.user.id,
      type: 'error',
      message: 'AI query processing failed',
      metadata: {
        error: error.message,
        query: req.body.query
      },
      severity: 2
    });

    res.status(500).json({
      message: 'Error processing AI query',
      error: error.message
    });
  }
};

exports.getQueryLogs = async (req, res) => {
  try {
    const logs = await Log.findAll({
      where: {
        userId: req.user.id,
        type: 'ai_query'
      },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching query logs',
      error: error.message
    });
  }
};

exports.getQueryAnalysis = async (req, res) => {
  try {
    const logs = await Log.findAll({
      where: {
        userId: req.user.id,
        type: 'ai_query'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalQueries'],
        [sequelize.fn('AVG', sequelize.col('metadata.response.usage.total_tokens')), 'avgTokens'],
        [sequelize.fn('MAX', sequelize.col('metadata.response.usage.total_tokens')), 'maxTokens']
      ]
    });

    res.json(logs[0]);
  } catch (error) {
    res.status(500).json({
      message: 'Error generating analysis',
      error: error.message
    });
  }
};

exports.getIncidents = async (req, res) => {
  try {
    const incidents = await Log.findAll({
      where: {
        userId: req.user.id,
        type: 'error',
        severity: {
          [Op.gt]: 1
        }
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json(incidents);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching incidents',
      error: error.message
    });
  }
};