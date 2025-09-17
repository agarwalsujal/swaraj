module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM,
        values: ['user', 'admin'],
        defaultValue: 'user'
      },
      googleId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      lastLogin: {
        type: Sequelize.DATE,
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

    // Add index to email for faster lookups
    await queryInterface.addIndex('Users', ['email']);
    // Add index to googleId for faster OAuth lookups
    await queryInterface.addIndex('Users', ['googleId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};