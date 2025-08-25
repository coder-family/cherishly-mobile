const axios = require('axios');

// Test script to login with the newly created account
const API_BASE_URL = 'https://growing-together-app.onrender.com/api';

async function testLoginWithNewAccount() {
  try {
    console.log('🔍 Testing login with newly created account...\n');

    // Test login with the account we just created
    console.log('1. Testing login with testuser@example.com...');
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email: 'testuser@example.com',
        password: 'Test123!'
      });
      
      console.log('✅ Login successful!');
      console.log('📋 Status:', response.status);
      console.log('📋 Response structure:');
      console.log('  - success:', response.data.success);
      console.log('  - message:', response.data.message);
      console.log('  - has data:', !!response.data.data);
      console.log('  - has user:', !!response.data.data?.user);
      console.log('  - has token:', !!response.data.data?.token);
      console.log('  - has refreshToken:', !!response.data.data?.refreshToken);
      
      console.log('\n📋 User data:');
      console.log('  - id:', response.data.data.user.id);
      console.log('  - email:', response.data.data.user.email);
      console.log('  - fullName:', response.data.data.user.fullName);
      console.log('  - role:', response.data.data.user.role);
      
      console.log('\n📋 Token info:');
      console.log('  - token length:', response.data.data.token?.length);
      console.log('  - refreshToken length:', response.data.data.refreshToken?.length);
      
      return response.data;
      
    } catch (error) {
      console.log('❌ Login failed');
      console.log('📋 Status:', error.response?.status);
      console.log('📋 Response data:', JSON.stringify(error.response?.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginWithNewAccount();
