const axios = require('axios');

const RENDER_API_URL = 'https://growing-together-app.onrender.com/api';

async function testRenderConnection() {
  console.log('🔍 Testing connection to Render backend...');
  console.log(`📍 API URL: ${RENDER_API_URL}`);
  
  try {
    // Test root API endpoint
    console.log('\n📡 Testing root API endpoint...');
    const response = await axios.get(`${RENDER_API_URL}/`, {
      timeout: 30000
    });
    
    console.log('✅ Backend is reachable!');
    console.log('📊 Response status:', response.status);
    console.log('📄 Response data:', response.data);
    
    // Test auth endpoints
    console.log('\n🔐 Testing authentication endpoints...');
    
    try {
      const authResponse = await axios.get(`${RENDER_API_URL}/auth/status`, {
        timeout: 30000
      });
      console.log('✅ Auth status endpoint is working!');
      console.log('📊 Auth status:', authResponse.status);
    } catch (authError) {
      console.log('⚠️ Auth status endpoint not available:', authError.response?.status || authError.message);
    }
    
    // Test user endpoints
    console.log('\n👤 Testing user endpoints...');
    
    try {
      const userResponse = await axios.get(`${RENDER_API_URL}/users/profile`, {
        timeout: 30000
      });
      console.log('✅ User profile endpoint is working!');
      console.log('📊 User status:', userResponse.status);
    } catch (userError) {
      console.log('⚠️ User profile endpoint (expected 401 without auth):', userError.response?.status || userError.message);
    }
    
    console.log('\n🎉 Backend connection test completed!');
    console.log('💡 The app should be able to connect to Render backend.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Tip: Make sure the Render backend is running and accessible');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Tip: Check your internet connection and the API URL');
    } else if (error.code === 'ECONNABORTED') {
      console.log('⏰ Request timed out - Render backend might be sleeping');
      console.log('💡 Tip: Try accessing the app first to wake up the backend');
    } else if (error.response) {
      console.log('📊 Server responded with status:', error.response.status);
      console.log('📄 Error data:', error.response.data);
    }
  }
}

// Run the test
testRenderConnection();
