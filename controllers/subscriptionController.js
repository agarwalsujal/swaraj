const Subscription = require('../models/subscriptionModel');
const Log = require('../models/logModel');

exports.getPlans = async (req, res) => {
  try {
    const plans = [
      {
        name: 'free',
        price: 0,
        features: ['Limited AI queries', 'Basic support'],
        monthlyQuota: 100
      },
      {
        name: 'basic',
        price: 9.99,
        features: ['1000 AI queries/month', 'Priority support', 'Advanced analytics'],
        monthlyQuota: 1000
      },
      {
        name: 'premium',
        price: 29.99,
        features: ['Unlimited AI queries', '24/7 support', 'Custom solutions'],
        monthlyQuota: -1 // unlimited
      }
    ];

    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
};

exports.getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id, status: 'active' }
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription', error: error.message });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const { plan } = req.body;

    // Check for existing subscription
    const existingSubscription = await Subscription.findOne({
      where: { userId: req.user.id, status: 'active' }
    });

    if (existingSubscription) {
      return res.status(400).json({ message: 'Active subscription already exists' });
    }

    // Create new subscription
    const subscription = await Subscription.create({
      userId: req.user.id,
      plan,
      status: 'active',
      startDate: new Date(),
      monthlyQuota: plan === 'premium' ? -1 : plan === 'basic' ? 1000 : 100
    });

    // Log subscription creation
    await Log.create({
      userId: req.user.id,
      type: 'info',
      message: `New subscription created: ${plan}`,
      metadata: { subscriptionId: subscription.id, plan }
    });

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Error creating subscription', error: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id, status: 'active' }
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    subscription.status = 'cancelled';
    subscription.endDate = new Date();
    await subscription.save();

    // Log cancellation
    await Log.create({
      userId: req.user.id,
      type: 'info',
      message: 'Subscription cancelled',
      metadata: { subscriptionId: subscription.id }
    });

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling subscription', error: error.message });
  }
};

exports.upgradeSubscription = async (req, res) => {
  try {
    const { plan } = req.body;

    const subscription = await Subscription.findOne({
      where: { userId: req.user.id, status: 'active' }
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Define plan hierarchy for validation
    const planHierarchy = { 'free': 0, 'basic': 1, 'premium': 2 };
    const planQuotas = { 'free': 100, 'basic': 1000, 'premium': -1 };

    if (planHierarchy[plan] <= planHierarchy[subscription.plan]) {
      return res.status(400).json({
        message: 'Cannot downgrade or set same plan. Use cancel and resubscribe for downgrades.'
      });
    }

    // Update subscription
    subscription.plan = plan;
    subscription.monthlyQuota = planQuotas[plan];
    subscription.quotaUsed = 0; // Reset quota on upgrade
    await subscription.save();

    // Log upgrade
    await Log.create({
      userId: req.user.id,
      type: 'info',
      message: `Subscription upgraded to ${plan}`,
      metadata: {
        subscriptionId: subscription.id,
        oldPlan: subscription.plan,
        newPlan: plan
      }
    });

    res.json({
      message: 'Subscription upgraded successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Error upgrading subscription', error: error.message });
  }
};

exports.getUsage = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id, status: 'active' }
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    res.json({
      quota: subscription.monthlyQuota,
      used: subscription.quotaUsed,
      remaining: subscription.monthlyQuota === -1 ? 'unlimited' :
        subscription.monthlyQuota - subscription.quotaUsed
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching usage', error: error.message });
  }
};

exports.getRemainingQuota = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id, status: 'active' }
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    const remaining = subscription.monthlyQuota === -1 ? 'unlimited' :
      subscription.monthlyQuota - subscription.quotaUsed;

    res.json({ remaining });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quota', error: error.message });
  }
};