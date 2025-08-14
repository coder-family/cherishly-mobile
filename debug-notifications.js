const axios = require('axios');

// Test notification APIs
async function testNotificationAPIs() {
  const baseURL = 'http://localhost:3000/api'; // Adjust to your backend URL
  
  try {
    console.log('🔍 Testing Notification APIs...\n');
    
    // Test 1: Get unread count
    console.log('1️⃣ Testing GET /notifications/unread-count');
    try {
      const unreadResponse = await axios.get(`${baseURL}/notifications/unread-count`);
      console.log('✅ Unread count response:', unreadResponse.data);
    } catch (error) {
      console.log('❌ Unread count error:', error.response?.data || error.message);
    }
    
    console.log('\n2️⃣ Testing GET /notifications');
    try {
      const notificationsResponse = await axios.get(`${baseURL}/notifications?page=1&limit=20`);
      console.log('✅ Notifications response:', notificationsResponse.data);
    } catch (error) {
      console.log('❌ Notifications error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

testNotificationAPIs();
