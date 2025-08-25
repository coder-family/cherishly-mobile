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

async function testCorrectFormat() {
  console.log('🔍 Testing with correct data format...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  
  // Test with correct format based on backend requirements
  const correctData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    password: 'TestPass123!',
    dateOfBirth: '1990-01-01',
    role: 'parent'
  };
  
  console.log('\n📝 Testing registration with correct format:');
  console.log('📄 Data:', JSON.stringify(correctData, null, 2));
  
  try {
    const response = await apiService.post('/users/', correctData);
    console.log(`✅ Success! Status: ${response.status}`);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    
    // If registration successful, test login
    console.log('\n🔐 Testing login with the same credentials...');
    const loginData = {
      email: correctData.email,
      password: correctData.password
    };
    
    try {
      const loginResponse = await apiService.post('/users/login', loginData);
      console.log(`✅ Login successful! Status: ${loginResponse.status}`);
      console.log('📄 Login response:', JSON.stringify(loginResponse.data, null, 2));
      
    } catch (loginError) {
      console.log(`❌ Login failed: ${loginError.response?.status || loginError.message}`);
      if (loginError.response?.data) {
        console.log('📄 Login error details:', JSON.stringify(loginError.response.data, null, 2));
      }
    }
    
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(`❌ Bad Request (400)`);
      console.log('📄 Error details:', JSON.stringify(error.response.data, null, 2));
    } else if (error.response?.status === 409) {
      console.log(`⚠️ Conflict (409) - User already exists`);
      console.log('📄 Error details:', JSON.stringify(error.response.data, null, 2));
      
      // Try login instead
      console.log('\n🔐 Trying login instead...');
      const loginData = {
        email: correctData.email,
        password: correctData.password
      };
      
      try {
        const loginResponse = await apiService.post('/users/login', loginData);
        console.log(`✅ Login successful! Status: ${loginResponse.status}`);
        console.log('📄 Login response:', JSON.stringify(loginResponse.data, null, 2));
        
      } catch (loginError) {
        console.log(`❌ Login failed: ${loginError.response?.status || loginError.message}`);
        if (loginError.response?.data) {
          console.log('📄 Login error details:', JSON.stringify(loginError.response.data, null, 2));
        }
      }
      
    } else {
      console.log(`❌ Error: ${error.response?.status || error.message}`);
      if (error.response?.data) {
        console.log('📄 Error details:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
  
  console.log('\n💡 Summary:');
  console.log('✅ If you see success responses, the backend is working correctly');
  console.log('🔐 409 errors mean user exists - try login instead');
  console.log('❌ 400 errors mean there are still validation issues');
}

testCorrectFormat();
