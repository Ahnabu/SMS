import { User } from '../modules/user/user.model';
import { UserRole } from '../modules/user/user.interface';
import { School } from '../modules/school/school.model';
import { SchoolStatus } from '../modules/school/school.interface';
import config from '../config';

/**
 * Seeds a superadmin user if none exists
 */
export async function seedSuperadmin(): Promise<void> {
  try {
    console.log('🌱 Checking for existing superadmin...');

    // Check if superadmin already exists
    const existingSuperadmin = await User.findOne({ role: UserRole.SUPERADMIN });

    if (existingSuperadmin) {
      console.log('✅ Superadmin already exists:', existingSuperadmin.username);
      return;
    }

    console.log('🌱 Creating initial superadmin user...');

    // Create default superadmin
    const superadminData = {
      schoolId: null, // Superadmin is not associated with any school
      role: UserRole.SUPERADMIN,
      username: config.superadmin_username || 'superadmin',
      passwordHash: config.superadmin_password || 'superadmin123', // Will be hashed by pre-save hook
      firstName: 'Super',
      lastName: 'Administrator',
      email: config.superadmin_email || 'superadmin@schoolmanagement.com',
      phone: '+1234567890',
      isActive: true,
    };

    const superadmin = await User.create(superadminData);

    console.log('✅ Superadmin created successfully:');
    console.log(`   Username: ${superadmin.username}`);
    console.log(`   Email: ${superadmin.email}`);
    console.log(`   ID: ${superadmin._id}`);
    console.log('⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error seeding superadmin:', error);
    throw error;
  }
}

/**
 * Seeds initial data for the application
 */
export async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed superadmin
    await seedSuperadmin();

    // Future: Add other seeding operations here
    // - Default school settings
    // - Default academic configurations
    // - etc.

    console.log('✅ Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

/**
 * Validates that essential users exist and are properly configured
 */
export async function validateSeeding(): Promise<boolean> {
  try {
    const superadmin = await User.findOne({ role: UserRole.SUPERADMIN });
    
    if (!superadmin) {
      console.error('❌ Validation failed: No superadmin user found');
      return false;
    }

    if (!superadmin.isActive) {
      console.error('❌ Validation failed: Superadmin user is not active');
      return false;
    }

    console.log('✅ Seeding validation passed');
    return true;

  } catch (error) {
    console.error('❌ Error validating seeding:', error);
    return false;
  }
}