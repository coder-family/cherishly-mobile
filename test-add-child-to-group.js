const axios = require('axios');

// Test script để kiểm tra API endpoint thêm trẻ vào nhóm gia đình
async function testAddChildToGroup() {
  const API_BASE_URL = "https://growing-together-app.onrender.com/api";
  
  // Thay thế bằng token thực tế
  const token = "YOUR_ACCESS_TOKEN_HERE";
  
  // Thay thế bằng ID thực tế
  const groupId = "YOUR_GROUP_ID_HERE";
  const childId = "YOUR_CHILD_ID_HERE";
  
  try {
    console.log('Testing add child to family group...');
    
    const response = await axios.post(
      `${API_BASE_URL}/family-groups/${groupId}/children`,
      { childId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    
    console.log('✅ Success!');
    
  } catch (error) {
    console.error('❌ Error:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

// Chạy test
testAddChildToGroup(); 