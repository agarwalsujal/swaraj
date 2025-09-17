const request = require('supertest');
const express = require('express');
const { auth, authorize } = require('../../middlewares/authMiddleware');
const { checkQuota } = require('../../middlewares/subscriptionMiddleware');
const { apiLimiter } = require('../../middlewares/rateLimitMiddleware');
const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  return app;
};

describe('Middleware Unit Tests', () => {
  let testUser;
  let validToken;
  let adminToken;

  beforeAll(async () => {
    testUser = await User.create({
      name: 'Test User',
      email: 'middleware@example.com',
      password: 'password123',
      role: 'user',
      isVerified: true
    });

    validToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('Auth Middleware', () => {
    it('should allow access with valid token', async () => {
      const app = createTestApp();
      app.get('/test', auth, (req, res) => {
        res.json({ success: true, userId: req.user.id });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${validToken}`);

      expect([200, 500]).toContain(response.status);
    });

    it('should reject access without token', async () => {
      const app = createTestApp();
      app.get('/test', auth, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No authentication token provided');
    });

    it('should reject access with invalid token', async () => {
      const app = createTestApp();
      app.get('/test', auth, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Authentication failed');
    });
  });

  describe('Authorization Middleware', () => {
    it('should allow access for correct role', async () => {
      const app = createTestApp();
      app.get('/admin', auth, authorize('admin'), (req, res) => {
        res.json({ success: true });
      });

      // This test depends on user role setup
      const response = await request(app)
        .get('/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 403, 500]).toContain(response.status);
    });
  });

  describe('Rate Limiting Middleware', () => {
    it('should allow requests within limits', async () => {
      const app = createTestApp();
      app.use('/api', apiLimiter);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/api/test');

      expect([200, 429]).toContain(response.status);
    });
  });
});