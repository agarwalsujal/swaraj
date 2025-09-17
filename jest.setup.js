// Setup env for tests
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DB_NAME = 'swaraj_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.GEMINI_API_KEY = 'test-api-key';

// Global test timeout
jest.setTimeout(30000);