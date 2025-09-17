const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/authRoutes');
const { errorHandler } = require('../../middlewares/errorMiddleware');

// Mock the user model
jest.mock('../../models/userModel', () => {
  return {
    findOne: jest.fn(),
    create: jest.fn()
  };
});

// Mock the token utils
jest.mock('../../utils/tokenUtils', () => {
  return {
    generateToken: jest.fn(() => 'mocked-token')
  };
});

// Create test express app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Auth Routes Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('email');
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('password');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('email');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('password');
    });
  });
});