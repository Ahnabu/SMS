const axios = require('axios');

// Simple test script to check if student API is working with schoolId filtering
async function testStudentAPI() {
    try {
        console.log('Testing student API with authentication...');
        
        // First, let's try to login to get auth token
        const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
            username: 'admin', // Use your admin credentials
            password: 'admin123' // Use your admin password
        });
        
        if (loginResponse.data.success) {
            console.log('Login successful!');
            const token = loginResponse.data.token;
            
            // Now test the students endpoint
            const studentsResponse = await axios.get('http://localhost:5000/api/v1/students', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    page: 1,
                    limit: 10
                }
            });
            
            console.log('Students API Response:');
            console.log('Success:', studentsResponse.data.success);
            console.log('Message:', studentsResponse.data.message);
            console.log('Total students:', studentsResponse.data.meta?.total || 0);
            console.log('Students data length:', studentsResponse.data.data?.length || 0);
            
            if (studentsResponse.data.data && studentsResponse.data.data.length > 0) {
                console.log('First student sample:');
                console.log(JSON.stringify(studentsResponse.data.data[0], null, 2));
            } else {
                console.log('No students found - this might be expected if there are no students for this school');
            }
        } else {
            console.log('Login failed:', loginResponse.data.message);
        }
        
    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

testStudentAPI();