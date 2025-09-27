// Simple test script to check subjects API
const fetch = require('node-fetch');

async function testSubjectsAPI() {
  try {
    console.log('🔍 Testing subjects API...');
    
    // First, try to hit the API without authentication
    const response = await fetch('http://localhost:5000/api/subjects');
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.text();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testSubjectsAPI();