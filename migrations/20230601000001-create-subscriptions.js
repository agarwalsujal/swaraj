module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Subscriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      plan: {
        type: Sequelize.ENUM,
        values: ['free', 'basic', 'premium', 'enterprise'],
        defaultValue: 'free'
      },
      status: {
        type: Sequelize.ENUM,
        values: ['active', 'canceled', 'expired', 'pending'],
        defaultValue: 'active'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      paymentId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      paymentProvider: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add index for faster user subscription lookups
    await queryInterface.addIndex('Subscriptions', ['userId']);
    // Add index for status to quickly filter active subscriptions
    await queryInterface.addIndex('Subscriptions', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Subscriptions');
  }
};