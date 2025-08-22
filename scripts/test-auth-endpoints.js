const axios = require('axios');

const API_BASE_URL = 'https://growing-together-app.onrender.com/api';

const apiService = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

async function testAuthEndpoints() {
  console.log('🔍 Testing authentication endpoints...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  
  // Test endpoints that the app actually uses
  const authEndpoints = [
    // Login endpoints
    { path: '/users/login', method: 'POST', description: 'User login (app uses this)' },
    { path: '/auth/login', method: 'POST', description: 'Auth login (alternative)' },
    
    // Register endpoints  
    { path: '/users/', method: 'POST', description: 'User registration (app uses this)' },
    { path: '/auth/register', method: 'POST', description: 'Auth registration (alternative)' },
    
    // Status endpoints
    { path: '/users/profile', method: 'GET', description: 'User profile (requires auth)' },
    { path: '/auth/status', method: 'GET', description: 'Auth status' }
  ];
  
  for (const endpoint of authEndpoints) {
    console.log(`\n🔐 Testing: ${endpoint.path} (${endpoint.method})`);
    console.log(`📝 Description: ${endpoint.description}`);
    
    try {
      let response;
      const testData = {
        email: 'test@example.com',
        password: 'testpassword'
      };
      
      if (endpoint.method === 'POST') {
        response = await apiService.post(endpoint.path, testData);
      } else {
        response = await apiService.get(endpoint.path);
      }
      
      console.log(`✅ ${endpoint.path} - Working (${response.status})`);
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`🔐 ${endpoint.path} - Requires auth (401) - This is expected for protected endpoints`);
      } else if (error.response?.status === 404) {
        console.log(`❌ ${endpoint.path} - Not found (404) - Endpoint doesn't exist`);
      } else if (error.response?.status === 405) {
        console.log(`⚠️ ${endpoint.path} - Method not allowed (405) - Wrong HTTP method`);
      } else if (error.response?.status === 400) {
        console.log(`⚠️ ${endpoint.path} - Bad request (400) - Invalid data format`);
      } else if (error.response?.status === 422) {
        console.log(`⚠️ ${endpoint.path} - Validation error (422) - Invalid input data`);
      } else {
        console.log(`❌ ${endpoint.path} - Error: ${error.response?.status || error.message}`);
      }
    }
  }
  
  console.log('\n💡 Analysis:');
  console.log('✅ Endpoints returning 401 are working but require authentication');
  console.log('❌ Endpoints returning 404 don\'t exist on the backend');
  console.log('⚠️ Endpoints returning 400/422 have validation issues');
  console.log('🔐 The app should use endpoints that return 401 (protected) or 200 (public)');
}

testAuthEndpoints();
