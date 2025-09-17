const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Log = sequelize.define('Log', {
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
  type: {
    type: DataTypes.ENUM('info', 'warning', 'error', 'ai_query'),
    defaultValue: 'info'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  severity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
});

module.exports = Log;