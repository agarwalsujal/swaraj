const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { auth } = require('../middlewares/authMiddleware');
const { validateSubscription } = require('../middlewares/validationMiddleware');

// Subscription management routes
router.get('/plans', subscriptionController.getPlans);
router.get('/my-subscription', auth, subscriptionController.getCurrentSubscription);
router.post('/subscribe', auth, validateSubscription, subscriptionController.subscribe);
router.put('/cancel', auth, subscriptionController.cancelSubscription);
router.put('/upgrade', auth, validateSubscription, subscriptionController.upgradeSubscription);

// Usage routes
router.get('/usage', auth, subscriptionController.getUsage);
router.get('/quota', auth, subscriptionController.getRemainingQuota);

module.exports = router;