const axios = require('axios');

// Simulate the app's API service configuration
const API_BASE_URL = 'https://growing-together-app.onrender.com/api';

const apiService = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

async function testAppConnection() {
  console.log('🔍 Testing app connection to Render backend...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  
  try {
    // Test 1: Test users endpoint (should return 401 without auth)
    console.log('\n👤 Test 1: Users endpoint (should require auth)...');
    try {
      const userResponse = await apiService.get('/users/profile');
      console.log('✅ Users endpoint accessible:', userResponse.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Users endpoint working (401 - auth required as expected)');
      } else {
        console.log('⚠️ Users endpoint error:', error.response?.status || error.message);
      }
    }
    
    // Test 2: Test auth endpoints
    console.log('\n🔐 Test 2: Auth endpoints...');
    const authEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/status'
    ];
    
    for (const endpoint of authEndpoints) {
      try {
        const response = await apiService.get(endpoint);
        console.log(`✅ ${endpoint} - Working (${response.status})`);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`❌ ${endpoint} - Not found (404)`);
        } else if (error.response?.status === 405) {
          console.log(`⚠️ ${endpoint} - Method not allowed (405)`);
        } else {
          console.log(`⚠️ ${endpoint} - Error: ${error.response?.status || error.message}`);
        }
      }
    }
    
    // Test 3: Test other endpoints
    console.log('\n📱 Test 3: Other app endpoints...');
    const otherEndpoints = [
      '/families',
      '/children',
      '/memories',
      '/health-records'
    ];
    
    for (const endpoint of otherEndpoints) {
      try {
        const response = await apiService.get(endpoint);
        console.log(`✅ ${endpoint} - Working (${response.status})`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`🔐 ${endpoint} - Requires auth (401)`);
        } else if (error.response?.status === 404) {
          console.log(`❌ ${endpoint} - Not found (404)`);
        } else {
          console.log(`⚠️ ${endpoint} - Error: ${error.response?.status || error.message}`);
        }
      }
    }
    
    console.log('\n🎉 App connection test completed!');
    console.log('💡 Your app should be able to connect to the working endpoints.');
    console.log('🔐 Endpoints returning 401 are working but require authentication.');
    console.log('❌ Endpoints returning 404 might not be implemented yet.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testAppConnection();
