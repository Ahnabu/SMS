// Simple Node.js script to test student API
const https = require('https');
const http = require('http');

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const req = client.request(url, {
            method: options.method || 'GET',
            headers: options.headers || {},
            ...options
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function testStudentAPI() {
    try {
        console.log('Testing student API backend fix...');
        
        // Test login first
        console.log('1. Attempting login...');
        const loginResponse = await makeRequest('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                username: 'admin',
                password: 'admin123'
            }
        });
        
        console.log('Login response status:', loginResponse.statusCode);
        console.log('Login response:', loginResponse.data);
        
        if (loginResponse.data.success && loginResponse.data.token) {
            console.log('2. Login successful, testing students endpoint...');
            
            const studentsResponse = await makeRequest('http://localhost:5000/api/v1/students?page=1&limit=10', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${loginResponse.data.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Students API status:', studentsResponse.statusCode);
            console.log('Students API response:', JSON.stringify(studentsResponse.data, null, 2));
            
        } else {
            console.log('Login failed, cannot test students endpoint');
        }
        
    } catch (error) {
        console.error('Test error:', error.message);
    }
}

testStudentAPI();