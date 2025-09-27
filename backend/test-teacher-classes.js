const axios = require('axios');

async function testTeacherClassesAPI() {
  try {
    // First, try to login with a teacher account to get auth token
    console.log('Testing Teacher Classes API...');
    
    // You would need to replace this with an actual teacher's credentials
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      username: 'teacher001', // Replace with actual teacher username
      password: 'teacher123'  // Replace with actual teacher password
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.accessToken;
      
      // Test the teacher classes endpoint
      const classesResponse = await axios.get('http://localhost:5000/api/v1/teachers/my-classes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Teacher Classes Response:', JSON.stringify(classesResponse.data, null, 2));
    } else {
      console.log('Login failed:', loginResponse.data);
    }
  } catch (error) {
    console.error('Error testing API:', error.response?.data || error.message);
  }
}

testTeacherClassesAPI();