#!/usr/bin/env node
/**
 * Simple API Tester for Swaraj Backend
 * Usage: node api-tester.js
 */

require('dotenv').config();

const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testAPI() {
  log(colors.bold + colors.blue, '\n🚀 Swaraj API Tester\n' + '='.repeat(50));

  let token = null; // Store JWT token for authenticated requests

  try {
    // Test 1: Health Check
    log(colors.yellow, '\n📋 1. Testing Health Check...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      log(colors.green, `✅ Health Check: ${healthResponse.status} - ${healthData.message}`);
    } else {
      log(colors.red, `❌ Health Check Failed: ${healthResponse.status}`);
    }

    // Test 2: User Registration
    log(colors.yellow, '\n👤 2. Testing User Registration...');
    const registerData = {
      name: 'API Test User',
      email: `test${Date.now()}@example.com`, // Unique email
      password: 'TestPassword123!'
    };

    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    if (registerResponse.ok) {
      const registerResult = await registerResponse.json();
      log(colors.green, `✅ Registration: ${registerResponse.status} - User created successfully`);
      console.log(`   User ID: ${registerResult.user?.id}, Email: ${registerResult.user?.email}`);
      token = registerResult.token;
    } else {
      const errorData = await registerResponse.json();
      log(colors.red, `❌ Registration Failed: ${registerResponse.status}`);
      console.log(`   Error: ${errorData.message}`);
      if (errorData.errors) console.log(`   Details: ${errorData.errors.join(', ')}`);
    }

    // Test 3: User Login
    log(colors.yellow, '\n🔐 3. Testing User Login...');
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };

    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      log(colors.green, `✅ Login: ${loginResponse.status} - Login successful`);
      token = loginResult.token; // Update token
      console.log(`   Token: ${token?.substring(0, 20)}...`);
    } else {
      const errorData = await loginResponse.json();
      log(colors.red, `❌ Login Failed: ${loginResponse.status}`);
      console.log(`   Error: ${errorData.message}`);
    }

    // Test 4: Protected Route (if token exists)
    if (token) {
      log(colors.yellow, '\n🔒 4. Testing Protected Route...');

      // Test AI endpoint
      const aiResponse = await fetch(`${baseUrl}/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: 'Hello, this is a test query'
        })
      });

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        log(colors.green, `✅ AI Query: ${aiResponse.status} - Response received`);
        console.log(`   Response: ${aiResult.response?.substring(0, 100)}...`);
      } else {
        const errorData = await aiResponse.json();
        log(colors.red, `❌ AI Query Failed: ${aiResponse.status}`);
        console.log(`   Error: ${errorData.message}`);
      }
    }

    // Test 5: Invalid Endpoints
    log(colors.yellow, '\n🚫 5. Testing Invalid Endpoint...');
    const invalidResponse = await fetch(`${baseUrl}/invalid-endpoint`);
    if (invalidResponse.status === 404) {
      log(colors.green, `✅ 404 Handling: Correctly returned 404 for invalid endpoint`);
    } else {
      log(colors.red, `❌ 404 Handling: Expected 404, got ${invalidResponse.status}`);
    }

  } catch (error) {
    log(colors.red, `🔥 Test Error: ${error.message}`);
  }

  log(colors.bold + colors.blue, '\n' + '='.repeat(50));
  log(colors.bold + colors.blue, '🏁 API Testing Complete!');
}

// Additional utility functions for specific testing
async function testValidation() {
  log(colors.bold + colors.blue, '\n🧪 Validation Tests\n' + '='.repeat(30));

  // Test invalid email
  log(colors.yellow, '📧 Testing invalid email...');
  const invalidEmailResponse = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123'
    })
  });

  if (invalidEmailResponse.status === 400) {
    const errorData = await invalidEmailResponse.json();
    log(colors.green, '✅ Invalid email validation working');
    console.log(`   Errors: ${errorData.errors?.join(', ')}`);
  }

  // Test short password
  log(colors.yellow, '🔑 Testing short password...');
  const shortPasswordResponse = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      password: '123'
    })
  });

  if (shortPasswordResponse.status === 400) {
    const errorData = await shortPasswordResponse.json();
    log(colors.green, '✅ Short password validation working');
    console.log(`   Errors: ${errorData.errors?.join(', ')}`);
  }
}

// Run tests
if (require.main === module) {
  console.log('Starting API tests...');
  console.log('Make sure your server is running on', baseUrl);

  testAPI().then(() => {
    return testValidation();
  }).then(() => {
    process.exit(0);
  }).catch(error => {
    log(colors.red, `Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { testAPI, testValidation };