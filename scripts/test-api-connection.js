#!/usr/bin/env node

const axios = require('axios');

// Test URLs
const testUrls = [
  'https://growing-together-app.onrender.com/api',
  'http://192.168.1.3:3001/api',
  'http://localhost:3001/api'
];

// Test endpoints
const testEndpoints = [
  '/auth/login',
  '/users',
  '/children',
  '/family-groups'
];

async function testApiConnection(url) {
  console.log(`\n🔍 Testing: ${url}`);
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`  Testing endpoint: ${endpoint}`);
      const response = await axios.get(`${url}${endpoint}`, { 
        timeout: 5000,
        validateStatus: function (status) {
          return status < 500; // Accept any status < 500 (including 401, 403, etc.)
        }
      });
      
      if (response.status === 200) {
        console.log(`  ✅ ${endpoint}: ${response.status} - Working!`);
        return true;
      } else if (response.status === 401 || response.status === 403) {
        console.log(`  ✅ ${endpoint}: ${response.status} - Endpoint exists (auth required)`);
        return true;
      } else {
        console.log(`  ⚠️  ${endpoint}: ${response.status}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`  ❌ ${endpoint}: Connection refused`);
        return false;
      } else if (error.response) {
        console.log(`  ⚠️  ${endpoint}: ${error.response.status}`);
      } else {
        console.log(`  ❌ ${endpoint}: ${error.message}`);
      }
    }
  }
  
  return false;
}

async function main() {
  console.log('🚀 Testing API Connections...\n');
  
  const results = [];
  
  for (const url of testUrls) {
    const success = await testApiConnection(url);
    results.push({ url, success });
  }
  
  console.log('\n📊 Summary:');
  results.forEach(({ url, success }) => {
    console.log(`${success ? '✅' : '❌'} ${url}`);
  });
  
  const workingUrls = results.filter(r => r.success);
  if (workingUrls.length > 0) {
    console.log(`\n🎉 Found ${workingUrls.length} working API endpoint(s)!`);
    console.log('Recommended API_BASE_URL for production:');
    console.log(workingUrls[0].url);
  } else {
    console.log('\n⚠️  No working API endpoints found!');
    console.log('Please check:');
    console.log('1. Backend server is running');
    console.log('2. URL is correct');
    console.log('3. Network connectivity');
  }
}

main().catch(console.error);
