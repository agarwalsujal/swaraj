const sequelize = require('../config/db');
const User = require('./userModel');
const Subscription = require('./subscriptionModel');
const Log = require('./logModel');

// Define associations
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Log, { foreignKey: 'userId', as: 'logs' });
Log.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Export models and sequelize
module.exports = {
  sequelize,
  User,
  Subscription,
  Log
};