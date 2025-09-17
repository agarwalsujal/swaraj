const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Create default users
    const users = await queryInterface.bulkInsert('Users', [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Test User',
        email: 'user@example.com',
        password: userPassword,
        role: 'user',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Get user IDs from the returned data
    const adminId = users[0].id;
    const userId = users[1].id;

    // Create subscriptions for the users
    await queryInterface.bulkInsert('Subscriptions', [
      {
        userId: adminId,
        plan: 'enterprise',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: userId,
        plan: 'free',
        status: 'active',
        startDate: new Date(),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Add some initial logs
    await queryInterface.bulkInsert('Logs', [
      {
        userId: null,
        level: 'info',
        message: 'System initialized',
        metadata: JSON.stringify({ event: 'system_start' }),
        timestamp: new Date(),
        source: 'seeder',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: adminId,
        level: 'info',
        message: 'Admin user created',
        metadata: JSON.stringify({ event: 'user_created', role: 'admin' }),
        timestamp: new Date(),
        source: 'seeder',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: userId,
        level: 'info',
        message: 'Regular user created',
        metadata: JSON.stringify({ event: 'user_created', role: 'user' }),
        timestamp: new Date(),
        source: 'seeder',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all seeded data in reverse order
    await queryInterface.bulkDelete('Logs', null, {});
    await queryInterface.bulkDelete('Subscriptions', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};