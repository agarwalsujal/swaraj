module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/config/',
    '/__tests__/fixtures/'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  setupFilesAfterEnv: ['./jest.setup.js']
};