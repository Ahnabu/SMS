#!/usr/bin/env node

import { seedDatabase, seedSuperadmin, validateSeeding } from '../utils/seeder';
import { database } from '../DB';
import { User } from '../modules/user/user.model';
import { UserRole } from '../modules/user/user.interface';

const args = process.argv.slice(2);
const command = args[0];

async function runCommand() {
  try {
    console.log('🔌 Connecting to database...');
    await database.connect();
    console.log('✅ Database connected');

    switch (command) {
      case 'seed':
        await seedDatabase();
        break;
        
      case 'seed-superadmin':
        await seedSuperadmin();
        break;
        
      case 'validate':
        const isValid = await validateSeeding();
        if (isValid) {
          console.log('✅ Validation passed');
          process.exit(0);
        } else {
          console.log('❌ Validation failed');
          process.exit(1);
        }
        break;
        
      case 'reset-superadmin':
        console.log('🗑️ Removing existing superadmin...');
        await User.deleteMany({ role: UserRole.SUPERADMIN });
        console.log('🌱 Creating new superadmin...');
        await seedSuperadmin();
        break;
        
      case 'list-users':
        const users = await User.find({}).select('username role firstName lastName isActive createdAt');
        console.log('👥 System Users:');
        console.table(users.map(user => ({
          Username: user.username,
          Role: user.role,
          Name: `${user.firstName} ${user.lastName}`,
          Active: user.isActive ? '✅' : '❌',
          Created: user.createdAt?.toLocaleDateString()
        })));
        break;
        
      case 'help':
      default:
        console.log(`
📚 School Management Seeder CLI

Usage: npm run seed [command]

Commands:
  seed              - Run complete database seeding
  seed-superadmin   - Create superadmin user only
  validate          - Validate seeding results
  reset-superadmin  - Remove and recreate superadmin
  list-users        - List all system users
  help              - Show this help message

Examples:
  npm run seed seed
  npm run seed validate
  npm run seed reset-superadmin
        `);
        break;
    }

    await database.disconnect();
    console.log('✅ Operation completed successfully');

  } catch (error) {
    console.error('❌ Operation failed:', error);
    await database.disconnect();
    process.exit(1);
  }
}

runCommand();