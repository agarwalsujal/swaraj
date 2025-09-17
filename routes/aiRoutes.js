const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { auth } = require('../middlewares/authMiddleware');
const { checkQuota } = require('../middlewares/subscriptionMiddleware');
const { validateAIQuery } = require('../middlewares/validationMiddleware');

// AI query routes
router.post('/query',
  auth,
  checkQuota,
  validateAIQuery,
  aiController.processQuery
);

// Logs and analysis routes
router.get('/logs', auth, aiController.getQueryLogs);
router.get('/analysis', auth, aiController.getQueryAnalysis);
router.get('/incidents', auth, aiController.getIncidents);

module.exports = router;