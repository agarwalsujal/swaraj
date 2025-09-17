// API Test Script
require('dotenv').config();

const testEndpoints = async () => {
  const baseUrl = 'http://localhost:3000/api';

  console.log('🧪 Testing Swaraj API Endpoints\n');
  console.log('='.repeat(50));

  // Test 1: Health Check
  console.log('\n1. Testing Health Check...');
  try {
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();
    console.log(`✅ Health Check: ${response.status} - ${data.message}`);
    console.log('   Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`❌ Health Check Failed: ${error.message}`);
  }

  // Test 2: User Registration
  console.log('\n2. Testing User Registration...');
  try {
    const registerData = {
      name: 'Test User API',
      email: 'testapi@example.com',
      password: 'TestPassword123!'
    };

    const response = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const data = await response.json();
    console.log(`${response.status === 201 ? '✅' : '❌'} Registration: ${response.status} - ${data.message}`);

    if (data.token) {
      console.log('   🔑 JWT Token received (first 50 chars):', data.token.substring(0, 50) + '...');
      // Store token for next test
      global.testToken = data.token;
    }
  } catch (error) {
    console.log(`❌ Registration Failed: ${error.message}`);
  }

  // Test 3: User Login
  console.log('\n3. Testing User Login...');
  try {
    const loginData = {
      email: 'admin@example.com', // Using seeded admin user
      password: 'admin123'
    };

    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();
    console.log(`${response.status === 200 ? '✅' : '❌'} Login: ${response.status} - ${data.message || 'Login attempt'}`);

    if (data.token) {
      console.log('   🔑 JWT Token received for admin user');
      global.adminToken = data.token;
    }
  } catch (error) {
    console.log(`❌ Login Failed: ${error.message}`);
  }

  // Test 4: Google OAuth (should return not configured message)
  console.log('\n4. Testing Google OAuth...');
  try {
    const response = await fetch(`${baseUrl}/auth/google`);
    const data = await response.json();
    console.log(`${response.status === 503 ? '✅' : '❌'} Google OAuth: ${response.status} - ${data.message}`);
  } catch (error) {
    console.log(`❌ Google OAuth Failed: ${error.message}`);
  }

  // Test 5: Subscription Plans
  console.log('\n5. Testing Subscription Plans...');
  try {
    const response = await fetch(`${baseUrl}/subscriptions/plans`);
    const data = await response.json();
    console.log(`${response.status === 200 ? '✅' : '❌'} Subscription Plans: ${response.status}`);
    if (response.status === 200) {
      console.log(`   📋 Available Plans: ${data.length} plans found`);
    }
  } catch (error) {
    console.log(`❌ Subscription Plans Failed: ${error.message}`);
  }

  // Test 6: AI Query (requires authentication)
  if (global.adminToken) {
    console.log('\n6. Testing AI Query...');
    try {
      const queryData = {
        query: 'Hello, this is a test query for the AI system.'
      };

      const response = await fetch(`${baseUrl}/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${global.adminToken}`
        },
        body: JSON.stringify(queryData)
      });

      const data = await response.json();
      console.log(`${response.status === 200 ? '✅' : '❌'} AI Query: ${response.status} - ${data.message || 'Query processed'}`);

      if (data.response) {
        console.log('   🤖 AI Response received (first 100 chars):', data.response.substring(0, 100) + '...');
      }
    } catch (error) {
      console.log(`❌ AI Query Failed: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 API Testing Complete!');
  console.log('\n📚 View full API documentation at: http://localhost:3000/api/docs');
};

// Run the tests
testEndpoints().catch(console.error);