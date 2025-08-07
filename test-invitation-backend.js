const axios = require('axios');

// Test script to debug backend invitation endpoint
const API_BASE_URL = 'http://192.168.10.219:3000/api'; // Update with your backend URL

async function testInvitationBackend() {
  try {
    console.log('🔍 Testing backend invitation endpoints...\n');

    // Test 1: Check if endpoint exists
    console.log('1. Testing endpoint availability...');
    try {
      const response = await axios.get(`${API_BASE_URL}/family-groups`);
      console.log('✅ Backend is reachable');
    } catch (error) {
      console.log('❌ Backend is not reachable:', error.message);
      return;
    }

    // Test 2: Test accept invitation with invalid token
    console.log('\n2. Testing accept invitation with invalid token...');
    try {
      const response = await axios.post(`${API_BASE_URL}/family-groups/accept-invitation`, {
        token: 'invalid-token-123'
      });
      console.log('✅ Unexpected success with invalid token');
    } catch (error) {
      console.log('📋 Response status:', error.response?.status);
      console.log('📋 Response data:', error.response?.data);
      console.log('📋 Error message:', error.response?.data?.message);
      
      if (error.response?.data?.message?.includes('expired')) {
        console.log('❌ Backend still checks expiration');
      } else if (error.response?.data?.message?.includes('not found')) {
        console.log('✅ Backend correctly handles invalid token');
      } else {
        console.log('❓ Unknown error handling');
      }
    }

    // Test 3: Test accept invitation with expired token (if you have one)
    console.log('\n3. Testing accept invitation with expired token...');
    try {
      const response = await axios.post(`${API_BASE_URL}/family-groups/accept-invitation`, {
        token: 'expired-token-test'
      });
      console.log('✅ Unexpected success with expired token');
    } catch (error) {
      console.log('📋 Response status:', error.response?.status);
      console.log('📋 Response data:', error.response?.data);
      
      if (error.response?.data?.message?.includes('expired')) {
        console.log('❌ Backend still checks expiration - NEEDS FIX');
        console.log('\n🔧 Backend needs to be updated to remove expiration checks');
      } else {
        console.log('✅ Backend handles expired token correctly');
      }
    }

    console.log('\n📋 Summary:');
    console.log('- Backend endpoint: /api/family-groups/accept-invitation');
    console.log('- Status 400 indicates validation error');
    console.log('- Message "Invalid or expired invitation" suggests expiration check');
    console.log('\n🔧 Required backend changes:');
    console.log('1. Remove expiration check in accept-invitation endpoint');
    console.log('2. Remove expiration check in decline-invitation endpoint');
    console.log('3. Update error messages to not mention "expired"');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testInvitationBackend(); 