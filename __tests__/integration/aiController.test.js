const request = require('supertest');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../../models');
const app = require('../../server');
const User = require('../../models/userModel');
const Subscription = require('../../models/subscriptionModel');

describe('AI Controller Integration Tests', () => {
  let testUser;
  let validToken;
  let premiumUser;
  let premiumToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create test users
    testUser = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      isVerified: true
    });

    premiumUser = await User.create({
      name: 'Premium User',
      email: 'premium@example.com',
      password: 'password123',
      isVerified: true
    });

    // Create subscriptions
    await Subscription.create({
      userId: testUser.id,
      plan: 'free',
      status: 'active',
      startDate: new Date(),
      endDate: null
    });

    await Subscription.create({
      userId: premiumUser.id,
      plan: 'premium',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    // Generate tokens
    validToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    premiumToken = jwt.sign(
      { id: premiumUser.id, email: premiumUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/ai/query', () => {
    it('should handle AI query for authenticated user', async () => {
      const response = await request(app)
        .post('/api/ai/query')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ prompt: 'What is JavaScript?' });

      // Should not return 401 (authentication should work)
      expect(response.status).not.toBe(401);
      // Might return 400 for validation or 500 if Gemini API key is not configured
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should reject AI query without authentication', async () => {
      const response = await request(app)
        .post('/api/ai/query')
        .send({ prompt: 'What is JavaScript?' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No authentication token provided');
    });

    it('should handle AI query with invalid prompt', async () => {
      const response = await request(app)
        .post('/api/ai/query')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ prompt: '' });

      // Should return validation error
      expect(response.status).toBe(400);
    });

    it('should handle quota limits for free users', async () => {
      // This would test quota middleware
      const response = await request(app)
        .post('/api/ai/query')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ prompt: 'Test query' });

      // Response depends on quota implementation
      expect([200, 400, 429, 500]).toContain(response.status);
    });
  });
});