// Simple test script to check login credentials
const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🔍 Testing login...');
    
    const loginData = {
      username: 'johndoe',
      password: 'admin123'
    };
    
    console.log('Trying to login with:', loginData.username);
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('❌ Error testing login:', error);
  }
}

testLogin();