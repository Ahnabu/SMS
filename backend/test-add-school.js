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

const testAddSchool = async () => {
  try {
    // First, login as superadmin
    console.log('🔐 Logging in as superadmin...');
    
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
    
    console.log('✅ Login successful!');
    const token = loginResponse.data.data.token;
    
    // Create an organization first
    console.log('🏢 Creating test organization...');
    
    const orgOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/organizations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const orgData = {
      name: 'Test Education Group ' + Date.now() // Add timestamp to avoid conflicts
    };
    
    const orgResponse = await makeRequest(orgOptions, orgData);
    console.log('Organization creation response status:', orgResponse.status);
    console.log('Full organization response:', JSON.stringify(orgResponse.data, null, 2));
    
    let orgId;
    if (orgResponse.status === 201 && orgResponse.data.success) {
      orgId = orgResponse.data.data.id; // Use 'id' instead of '_id'
      console.log('✅ Organization created successfully:', orgId);
    } else {
      console.log('❌ Organization creation failed:', orgResponse.data);
      return;
    }
    
    // Now, test school creation
    console.log('🏫 Testing school creation...');
    
    const schoolOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/superadmin/schools',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const schoolData = {
      orgId: orgId,
      name: 'Test High School ' + Date.now(),
      establishedYear: 2020,
      address: {
        street: '123 Education Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        postalCode: '12345'
      },
      contact: {
        phone: '+1-555-0123',
        email: 'admin@testschool.edu',
        website: 'https://testschool.edu'
      },
      adminDetails: {
        firstName: 'Test',
        lastName: 'Admin',
        email: 'testadmin@testschool.edu',
        phone: '+1-555-0124',
        username: 'testadmin' + Date.now(),
        password: 'TestAdmin123!'
      },
      currentSession: {
        name: '2024-25',
        startDate: new Date('2024-04-01').toISOString(),
        endDate: new Date('2025-03-31').toISOString()
      },
      settings: {
        maxStudentsPerSection: 30,
        grades: [9, 10, 11, 12],
        sections: ['A', 'B'],
        academicYearStart: 4,
        academicYearEnd: 3,
        attendanceGracePeriod: 15,
        maxPeriodsPerDay: 8,
        timezone: 'America/New_York',
        language: 'en', // Use 'en' instead of 'English'
        currency: 'USD',
        attendanceLockAfterDays: 7,
        maxAttendanceEditHours: 24
      },
      affiliation: 'CBSE',
      recognition: 'Recognized by State Education Board'
    };
    
    const schoolResponse = await makeRequest(schoolOptions, schoolData);
    console.log('🏫 School creation response status:', schoolResponse.status);
    
    if (schoolResponse.status === 201) {
      console.log('✅ School created successfully!');
      console.log('School Data:', JSON.stringify(schoolResponse.data, null, 2));
    } else {
      console.log('❌ School creation failed:');
      console.log('Response:', JSON.stringify(schoolResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAddSchool();