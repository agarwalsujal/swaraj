module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      level: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      source: {
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

    // Add index for faster log level filtering
    await queryInterface.addIndex('Logs', ['level']);
    // Add index for faster timestamp filtering
    await queryInterface.addIndex('Logs', ['timestamp']);
    // Add index for faster user-specific log searches
    await queryInterface.addIndex('Logs', ['userId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Logs');
  }
};