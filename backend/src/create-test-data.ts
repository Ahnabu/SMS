import { database } from './app/DB';
import { Subject } from './app/modules/subject/subject.model';
import { School } from './app/modules/school/school.model';
import { User } from './app/modules/user/user.model';
import { UserRole } from './app/modules/user/user.interface';

async function createTestData() {
  try {
    console.log('🔌 Connecting to database...');
    await database.connect();
    console.log('✅ Database connected');

    // Check if there's a superadmin user
    const superadmin = await User.findOne({ role: UserRole.SUPERADMIN });
    console.log('👤 Superadmin found:', superadmin ? 'Yes' : 'No');

    // Create a test school if none exists
    let testSchool = await School.findOne();
    if (!testSchool) {
      console.log('🏫 Creating test school...');
      testSchool = await School.create({
        name: 'Test School',
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        },
        contactInfo: {
          phone: '+1234567890',
          email: 'test@testschool.edu',
          website: 'https://testschool.edu'
        },
        status: 'ACTIVE',
        isActive: true,
        establishedYear: 2024,
        createdBy: superadmin?._id || undefined
      });
      console.log('✅ Test school created:', testSchool.name);
    } else {
      console.log('✅ Using existing school:', testSchool.name);
    }

    // Check if subjects already exist
    const existingSubjects = await Subject.countDocuments({ schoolId: testSchool._id });
    console.log('📚 Existing subjects count:', existingSubjects);

    if (existingSubjects === 0) {
      console.log('🌱 Creating sample subjects...');

      const sampleSubjects = [
        {
          schoolId: testSchool._id,
          name: 'Mathematics',
          code: 'MATH',
          description: 'Core mathematics curriculum',
          grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          isCore: true,
          credits: 4,
          teachers: [],
          isActive: true,
        },
        {
          schoolId: testSchool._id,
          name: 'English Language Arts',
          code: 'ELA',
          description: 'English language and literature',
          grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          isCore: true,
          credits: 4,
          teachers: [],
          isActive: true,
        },
        {
          schoolId: testSchool._id,
          name: 'Science',
          code: 'SCI',
          description: 'General science curriculum',
          grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          isCore: true,
          credits: 3,
          teachers: [],
          isActive: true,
        },
        {
          schoolId: testSchool._id,
          name: 'Social Studies',
          code: 'SS',
          description: 'History and social sciences',
          grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          isCore: true,
          credits: 3,
          teachers: [],
          isActive: true,
        },
        {
          schoolId: testSchool._id,
          name: 'Physical Education',
          code: 'PE',
          description: 'Physical education and health',
          grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          isCore: false,
          credits: 2,
          teachers: [],
          isActive: true,
        },
        {
          schoolId: testSchool._id,
          name: 'Art',
          code: 'ART',
          description: 'Visual arts and creative expression',
          grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          isCore: false,
          credits: 1,
          teachers: [],
          isActive: true,
        },
      ];

      const subjects = await Subject.insertMany(sampleSubjects);

      console.log('✅ Sample subjects created successfully:');
      subjects.forEach(subject => {
        console.log(`   - ${subject.name} (${subject.code})`);
      });
    } else {
      console.log('✅ Subjects already exist');
      const subjects = await Subject.find({ schoolId: testSchool._id }).select('name code');
      subjects.forEach(subject => {
        console.log(`   - ${subject.name} (${subject.code})`);
      });
    }

    // Create test admin user if none exists for this school
    let adminUser = await User.findOne({ 
      role: UserRole.ADMIN, 
      schoolId: testSchool._id 
    });

    if (!adminUser && superadmin) {
      console.log('👤 Creating test admin user...');
      adminUser = await User.create({
        schoolId: testSchool._id,
        role: UserRole.ADMIN,
        username: 'admin',
        passwordHash: 'admin123', // Will be hashed by pre-save hook
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@testschool.edu',
        phone: '+1234567891',
        isActive: true,
        createdBy: superadmin._id,
      });
      console.log('✅ Test admin created:');
      console.log(`   Username: ${adminUser.username}`);
      console.log(`   Password: admin123`);
      console.log(`   School: ${testSchool.name}`);
    } else if (adminUser) {
      console.log('✅ Admin user already exists:', adminUser.username);
    }

    console.log('\n🎉 Test data setup complete!');
    console.log('You can now log in with:');
    console.log('- Username: admin');
    console.log('- Password: admin123');

    await database.disconnect();
    console.log('✅ Database disconnected');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    await database.disconnect();
    process.exit(1);
  }
}

createTestData();