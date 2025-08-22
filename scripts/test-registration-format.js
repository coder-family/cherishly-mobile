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

async function testRegistrationFormats() {
  console.log('🔍 Testing registration data formats...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  
  // Test different registration data formats
  const testCases = [
    {
      name: 'Full app format (with role)',
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        dateOfBirth: '1990-01-01',
        role: 'parent'
      }
    },
    {
      name: 'Without role field',
      data: {
        firstName: 'Test',
        lastName: 'User', 
        email: 'test2@example.com',
        password: 'password123',
        dateOfBirth: '1990-01-01'
      }
    },
    {
      name: 'Minimal required fields',
      data: {
        firstName: 'Test',
        email: 'test3@example.com',
        password: 'password123'
      }
    },
    {
      name: 'With different date format',
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test4@example.com',
        password: 'password123',
        dateOfBirth: '01/01/1990'
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.name}`);
    console.log('📄 Data:', JSON.stringify(testCase.data, null, 2));
    
    try {
      const response = await apiService.post('/users/', testCase.data);
      console.log(`✅ Success! Status: ${response.status}`);
      console.log('📄 Response:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`❌ Bad Request (400)`);
        console.log('📄 Error details:', JSON.stringify(error.response.data, null, 2));
      } else if (error.response?.status === 422) {
        console.log(`⚠️ Validation Error (422)`);
        console.log('📄 Validation errors:', JSON.stringify(error.response.data, null, 2));
      } else if (error.response?.status === 409) {
        console.log(`⚠️ Conflict (409) - User might already exist`);
        console.log('📄 Error details:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log(`❌ Error: ${error.response?.status || error.message}`);
        if (error.response?.data) {
          console.log('📄 Error details:', JSON.stringify(error.response.data, null, 2));
        }
      }
    }
  }
  
  console.log('\n💡 Analysis:');
  console.log('✅ 200/201 responses mean the format is correct');
  console.log('❌ 400 responses mean the data format is wrong');
  console.log('⚠️ 422 responses mean validation failed');
  console.log('🔐 409 responses mean user already exists');
}

testRegistrationFormats();
