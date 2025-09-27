import { database } from './app/DB';
import { User } from './app/modules/user/user.model';

async function listUsers() {
  try {
    console.log('🔌 Connecting to database...');
    await database.connect();
    console.log('✅ Database connected');

    const users = await User.find({}).select('username role firstName lastName email schoolId isActive createdAt');
    
    console.log('\n👥 System Users:');
    console.log('================');
    
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   School ID: ${user.schoolId}`);
        console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
        console.log(`   Created: ${user.createdAt?.toLocaleDateString()}`);
      });
    }

    await database.disconnect();
    console.log('\n✅ Database disconnected');

  } catch (error) {
    console.error('❌ Error listing users:', error);
    await database.disconnect();
    process.exit(1);
  }
}

listUsers();