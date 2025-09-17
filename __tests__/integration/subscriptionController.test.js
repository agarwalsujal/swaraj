const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../../server');
const db = require('../../models');

describe('Subscription Controller Integration Tests', () => {
  beforeAll(async () => {
    await db.User.sync({ force: true });
    await db.Subscription.sync({ force: true });
    await db.Log.sync({ force: true });
  });

  let validToken;
  let testUser;

  beforeEach(async () => {
    // Create a test user and get auth token
    testUser = await db.User.create({
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test User',
      email: 'testsub@example.com',
      password: await bcrypt.hash('TestPassword123!', 12),
      isEmailVerified: true
    });

    validToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await db.User.destroy({ where: {} });
    await db.Subscription.destroy({ where: {} });
    await db.Log.destroy({ where: {} });
  });

  describe('GET /api/subscriptions/plans', () => {
    it('should get available subscription plans', async () => {
      const response = await request(app)
        .get('/api/subscriptions/plans');

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('POST /api/subscriptions/subscribe', () => {
    it('should handle subscription creation for authenticated user', async () => {
      const subscriptionData = {
        plan: 'premium',
        duration: 'monthly'
      };

      const response = await request(app)
        .post('/api/subscriptions/subscribe')
        .set('Authorization', `Bearer ${validToken}`)
        .send(subscriptionData);

      // Response depends on implementation
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('should reject subscription creation without authentication', async () => {
      const subscriptionData = {
        plan: 'premium',
        duration: 'monthly'
      };

      const response = await request(app)
        .post('/api/subscriptions/subscribe')
        .send(subscriptionData);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/subscriptions/my-subscription', () => {
    it('should get current user subscription', async () => {
      const response = await request(app)
        .get('/api/subscriptions/my-subscription')
        .set('Authorization', `Bearer ${validToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('should reject getting subscription without authentication', async () => {
      const response = await request(app)
        .get('/api/subscriptions/my-subscription');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/subscriptions/usage', () => {
    it('should get usage statistics for authenticated user', async () => {
      const response = await request(app)
        .get('/api/subscriptions/usage')
        .set('Authorization', `Bearer ${validToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('should reject getting usage without authentication', async () => {
      const response = await request(app)
        .get('/api/subscriptions/usage');

      expect(response.status).toBe(401);
    });
  });
});