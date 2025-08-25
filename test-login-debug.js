const axios = require('axios');

// Test script to debug login issues
const API_BASE_URL = 'https://growing-together-app.onrender.com/api';

async function testLoginDebug() {
  try {
    console.log('🔍 Testing login with different scenarios...\n');

    // Test 1: Check if endpoint exists and responds
    console.log('1. Testing endpoint availability...');
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email: 'test@example.com',
        password: 'test123'
      });
      console.log('✅ Login successful (unexpected with test credentials)');
      console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('📋 Status:', error.response?.status);
      console.log('📋 Response data:', JSON.stringify(error.response?.data, null, 2));
      console.log('📋 Headers:', JSON.stringify(error.response?.headers, null, 2));
      
      if (error.response?.status === 401) {
        console.log('✅ Endpoint exists and requires valid credentials');
      } else {
        console.log('❌ Unexpected error');
      }
    }

    // Test 2: Test with empty credentials
    console.log('\n2. Testing with empty credentials...');
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email: '',
        password: ''
      });
      console.log('✅ Login successful (unexpected)');
    } catch (error) {
      console.log('📋 Status:', error.response?.status);
      console.log('📋 Response data:', JSON.stringify(error.response?.data, null, 2));
    }

    // Test 3: Test with malformed data
    console.log('\n3. Testing with malformed data...');
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email: 'invalid-email',
        password: '123'
      });
      console.log('✅ Login successful (unexpected)');
    } catch (error) {
      console.log('📋 Status:', error.response?.status);
      console.log('📋 Response data:', JSON.stringify(error.response?.data, null, 2));
    }

    // Test 4: Test with missing fields
    console.log('\n4. Testing with missing fields...');
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email: 'test@example.com'
        // missing password
      });
      console.log('✅ Login successful (unexpected)');
    } catch (error) {
      console.log('📋 Status:', error.response?.status);
      console.log('📋 Response data:', JSON.stringify(error.response?.data, null, 2));
    }

    console.log('\n💡 Analysis:');
    console.log('- If you see 401 errors, the endpoint is working but credentials are invalid');
    console.log('- If you see 400/422 errors, there might be validation issues');
    console.log('- If you see 404 errors, the endpoint might not exist');
    console.log('- The app expects a specific response structure with user, accessToken, refreshToken');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginDebug();
