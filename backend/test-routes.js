const http = require('http');

const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

// Test superadmin login first
const testRoutes = async () => {
  try {
    console.log('Testing superadmin login...');
    
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const loginData = {
      username: 'superadmin',
      password: 'super123'
    };
    
    const loginResponse = await makeRequest(loginOptions, loginData);
    
    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginResponse.data)}`);
    }
    
    console.log('Login successful!');
    const token = loginResponse.data.data.token;
    
    // Test the schools endpoint
    console.log('Testing GET /api/superadmin/schools...');
    
    const schoolsOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/superadmin/schools',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const schoolsResponse = await makeRequest(schoolsOptions);
    
    if (schoolsResponse.status !== 200) {
      throw new Error(`Schools endpoint failed: ${JSON.stringify(schoolsResponse.data)}`);
    }
    
    console.log('Schools endpoint working!', schoolsResponse.data);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testRoutes();