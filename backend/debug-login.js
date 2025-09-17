const http = require('http');

const testLogin = async () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const data = {
    username: 'superadmin',
    password: 'super123'
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(body);
        console.log('Login response status:', res.statusCode);
        console.log('Login response:', JSON.stringify(response, null, 2));
        
        if (response.data && response.data.accessToken) {
          console.log('\nToken received:', response.data.accessToken.substring(0, 50) + '...');
        }
      } catch (e) {
        console.log('Response body:', body);
      }
    });
  });

  req.on('error', console.error);
  req.write(JSON.stringify(data));
  req.end();
};

testLogin();