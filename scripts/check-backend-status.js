const axios = require('axios');

const BASE_URL = 'https://growing-together-app.onrender.com';

async function checkBackendStatus() {
  console.log('🔍 Checking Render backend status...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  // Test 1: Check if the domain is reachable
  console.log('\n📡 Test 1: Domain reachability...');
  try {
    const response = await axios.get(BASE_URL, {
      timeout: 30000,
      validateStatus: () => true // Accept any status code
    });
    
    console.log('✅ Domain is reachable!');
    console.log('📊 Status:', response.status);
    console.log('📄 Content type:', response.headers['content-type']);
    
    if (response.status === 200) {
      console.log('🎉 Backend is running and responding!');
    } else if (response.status === 404) {
      console.log('⚠️ Backend is running but no root endpoint configured');
    }
    
  } catch (error) {
    console.error('❌ Domain not reachable:', error.message);
    return;
  }
  
  // Test 2: Check API endpoints
  console.log('\n🔌 Test 2: API endpoints...');
  const apiEndpoints = [
    '/api',
    '/api/auth',
    '/api/users',
    '/api/families',
    '/api/children',
    '/api/health'
  ];
  
  for (const endpoint of apiEndpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: 10000,
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        console.log(`✅ ${endpoint} - Working (${response.status})`);
      } else if (response.status === 401) {
        console.log(`🔐 ${endpoint} - Requires auth (${response.status})`);
      } else if (response.status === 404) {
        console.log(`❌ ${endpoint} - Not found (${response.status})`);
      } else {
        console.log(`⚠️ ${endpoint} - Status ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
    }
  }
  
  console.log('\n💡 Next steps:');
  console.log('1. If backend is running, your app should be able to connect');
  console.log('2. If you see 401 errors, that means auth is working');
  console.log('3. If you see 404 errors, those endpoints might not exist yet');
  console.log('4. Try running the app and see if it can connect to the working endpoints');
}

checkBackendStatus();
