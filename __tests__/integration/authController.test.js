const request = require('supertest');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../../models');
const app = require('../../server');
const User = require('../../models/userModel');

describe('Auth Controller Integration Tests', () => {
  let testUser;
  let validToken;
  let expiredToken;
  let invalidToken = 'invalid.jwt.token';

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      isVerified: true
    });

    // Generate valid token
    validToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate expired token
    expiredToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' } // Already expired
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Registration successful. Please check your email for verification.');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toMatchObject({
        email: userData.email,
        name: userData.name,
        isVerified: false
      });
      expect(response.body.user.id).toBeDefined();

      // Verify user was created in database
      const createdUser = await User.findOne({ where: { email: userData.email } });
      expect(createdUser).toBeTruthy();
      expect(createdUser.name).toBe(userData.name);
    });

    it('should return 400 for duplicate email registration', async () => {
      const userData = {
        name: 'Duplicate User',
        email: 'testuser@example.com', // Same as existing testUser
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should handle database errors during registration', async () => {
      // Mock User.create to throw an error
      jest.spyOn(User, 'create').mockRejectedValueOnce(new Error('Database error'));

      const userData = {
        name: 'Error User',
        email: 'erroruser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error during registration');

      User.create.mockRestore();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      });
    });

    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should handle database errors during login', async () => {
      // Mock User.findOne to throw an error
      jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('Database error'));

      const loginData = {
        email: 'testuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error during login');

      User.findOne.mockRestore();
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should handle forgot password for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'testuser@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('If the email exists, a reset link has been sent');
      // In test environment, resetToken might not be returned
      if (process.env.NODE_ENV === 'development') {
        expect(response.body.resetToken).toBeDefined();
      }
    }); it('should handle forgot password for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('If the email exists, a reset link has been sent');
      expect(response.body.resetToken).toBeUndefined();
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email is required');
    });
  });

  describe('POST /api/auth/reset-password/:token', () => {
    it('should reset password with valid token', async () => {
      const resetToken = jwt.sign(
        { userId: testUser.id, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: 'newpassword123' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password reset successful');
    });

    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password/invalid-token')
        .send({ password: 'newpassword123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired reset token');
    });

    it('should return 400 for expired token', async () => {
      const expiredResetToken = jwt.sign(
        { userId: testUser.id, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .post(`/api/auth/reset-password/${expiredResetToken}`)
        .send({ password: 'newpassword123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired reset token');
    });

    it('should return 400 for short password', async () => {
      const resetToken = jwt.sign(
        { userId: testUser.id, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password must be at least 6 characters long');
    });

    it('should return 400 for wrong token type', async () => {
      const wrongToken = jwt.sign(
        { userId: testUser.id, type: 'email_verification' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post(`/api/auth/reset-password/${wrongToken}`)
        .send({ password: 'newpassword123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid reset token');
    });
  });

  describe('GET /api/auth/verify-email/:token', () => {
    let unverifiedUser;

    beforeEach(async () => {
      unverifiedUser = await User.create({
        name: 'Unverified User',
        email: 'unverified@example.com',
        password: 'password123',
        isVerified: false
      });
    });

    afterEach(async () => {
      await User.destroy({ where: { email: 'unverified@example.com' } });
    });

    it('should verify email with valid token', async () => {
      const verificationToken = jwt.sign(
        { userId: unverifiedUser.id, type: 'email_verification' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .get(`/api/auth/verify-email/${verificationToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Email verified successfully');

      // Verify user is now verified in database
      const updatedUser = await User.findByPk(unverifiedUser.id);
      expect(updatedUser.isVerified).toBe(true);
    });

    it('should handle already verified email', async () => {
      const verificationToken = jwt.sign(
        { userId: testUser.id, type: 'email_verification' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .get(`/api/auth/verify-email/${verificationToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Email already verified');
    });

    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email/invalid-token');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired verification token');
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    let unverifiedUser;

    beforeEach(async () => {
      unverifiedUser = await User.create({
        name: 'Unverified User 2',
        email: 'unverified2@example.com',
        password: 'password123',
        isVerified: false
      });
    });

    afterEach(async () => {
      await User.destroy({ where: { email: 'unverified2@example.com' } });
    });

    it('should resend verification for unverified user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'unverified2@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Verification email sent');
      // In test environment, verificationToken might not be returned
      if (process.env.NODE_ENV === 'development') {
        expect(response.body.verificationToken).toBeDefined();
      }
    }); it('should handle already verified user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'testuser@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Email is already verified');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email is required');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('Protected Routes JWT Testing', () => {
    describe('Valid JWT Token', () => {
      it('should access protected route with valid token', async () => {
        const response = await request(app)
          .post('/api/ai/query')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ prompt: 'Test query' });

        // Should not return 401 (token should be valid)
        expect(response.status).not.toBe(401);
      });
    });

    describe('Invalid JWT Token', () => {
      it('should reject access with invalid token', async () => {
        const response = await request(app)
          .post('/api/ai/query')
          .set('Authorization', `Bearer ${invalidToken}`)
          .send({ prompt: 'Test query' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Authentication failed');
      });

      it('should reject access with malformed token', async () => {
        const response = await request(app)
          .post('/api/ai/query')
          .set('Authorization', 'Bearer malformed-token')
          .send({ prompt: 'Test query' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Authentication failed');
      });

      it('should reject access without token', async () => {
        const response = await request(app)
          .post('/api/ai/query')
          .send({ prompt: 'Test query' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('No authentication token provided');
      });
    });

    describe('Expired JWT Token', () => {
      it('should reject access with expired token', async () => {
        const response = await request(app)
          .post('/api/ai/query')
          .set('Authorization', `Bearer ${expiredToken}`)
          .send({ prompt: 'Test query' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Authentication failed');
      });
    });
  });

  describe('Google OAuth Routes', () => {
    it('should return 503 when Google OAuth is not configured', async () => {
      const response = await request(app)
        .get('/api/auth/google');

      // Google OAuth might redirect or return service unavailable
      expect([302, 503]).toContain(response.status);
    });

    it('should return 503 for Google callback when OAuth is not configured', async () => {
      const response = await request(app)
        .get('/api/auth/google/callback');

      // Google OAuth callback might redirect or return service unavailable  
      expect([302, 503]).toContain(response.status);
    });
  });

  // Edge Cases and Error Scenarios
  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JWT tokens in protected routes', async () => {
      // Using logout which is not protected but testing the behavior
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer malformed.jwt.token');

      // Logout doesn't require auth, so it should succeed
      expect(response.status).toBe(200);
    });

    it('should handle expired JWT tokens in protected routes', async () => {
      // Create an expired token using the tokenUtils
      const expiredToken = jwt.sign(
        { id: 1, email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '0s' } // Immediately expired
      );

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${expiredToken}`);

      // Logout doesn't require auth, so it should succeed
      expect(response.status).toBe(200);
    });

    it('should handle login attempt with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should handle password reset for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });

      // Should still return success to prevent email enumeration
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('If the email exists, a reset link has been sent');
    });

    it('should handle duplicate registration attempts', async () => {
      const userData = {
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'Password123!'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Attempt duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });

    it('should handle invalid email verification tokens', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email/invalid-token-12345');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid');
    });

    it('should handle invalid password reset tokens', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password/invalid-reset-token')
        .send({
          password: 'NewPassword123!'
        });

      expect(response.status).toBe(400);
    });

    it('should validate password strength requirements', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'weakpass@example.com',
          password: '123' // Too weak
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should handle resend verification requests', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'test@example.com' });

      // Should return 404 for non-existent user or 200 for existing
      expect([200, 404]).toContain(response.status);
    });

    it('should handle resend verification with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});