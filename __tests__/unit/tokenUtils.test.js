const tokenUtils = require('../../utils/tokenUtils');
const jwt = require('jsonwebtoken');

// Mock the environment variables
process.env.JWT_SECRET = 'test-secret';

describe('Token Utils', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = { id: 1, name: 'Test User' };
      const token = tokenUtils.generateToken(user);

      // Verify the token is a string
      expect(typeof token).toBe('string');

      // Verify the token is valid JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded).toBeTruthy();
      expect(decoded.id).toBe(user.id);
    });

    it('should set token expiration correctly', () => {
      const user = { id: 1, name: 'Test User' };
      const expiresIn = '1h';
      const token = tokenUtils.generateToken(user, expiresIn);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check that expiration time is set (exp exists)
      expect(decoded.exp).toBeTruthy();

      // Check that the token is not expired
      const currentTime = Math.floor(Date.now() / 1000);
      expect(decoded.exp).toBeGreaterThan(currentTime);

      // Check that the token expires close to 1 hour from now
      // Allow a small margin of error (5 seconds)
      const expectedExp = currentTime + 60 * 60;
      expect(decoded.exp).toBeCloseTo(expectedExp, -2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const user = { id: 1, name: 'Test User' };
      const token = tokenUtils.generateToken(user);

      const decoded = tokenUtils.verifyToken(token);
      expect(decoded).toBeTruthy();
      expect(decoded.id).toBe(user.id);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        tokenUtils.verifyToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      // Create a token that is already expired
      const user = { id: 1, name: 'Test User' };
      const expiredToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '-10s' } // Expired 10 seconds ago
      );

      expect(() => {
        tokenUtils.verifyToken(expiredToken);
      }).toThrow(/expired/i);
    });
  });
});