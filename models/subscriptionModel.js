const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  plan: {
    type: DataTypes.ENUM('free', 'basic', 'premium'),
    defaultValue: 'free'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'cancelled'),
    defaultValue: 'active'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  monthlyQuota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100 // default quota for free plan
  },
  quotaUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = Subscription;