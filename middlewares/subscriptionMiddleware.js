const Subscription = require('../models/subscriptionModel');

exports.checkQuota = async (req, res, next) => {
  try {
    // Find user's active subscription
    const subscription = await Subscription.findOne({
      where: {
        userId: req.user.id,
        status: 'active'
      }
    });

    if (!subscription) {
      return res.status(403).json({
        message: 'No active subscription found'
      });
    }

    // Check if user has quota remaining (unlimited for premium = -1)
    if (subscription.monthlyQuota !== -1 && subscription.quotaUsed >= subscription.monthlyQuota) {
      return res.status(429).json({
        message: 'Monthly quota exceeded. Please upgrade your plan or wait for next month.',
        quota: subscription.monthlyQuota,
        used: subscription.quotaUsed
      });
    }

    // Attach subscription to request for use in controller
    req.subscription = subscription;
    next();
  } catch (error) {
    res.status(500).json({
      message: 'Error checking quota',
      error: error.message
    });
  }
};