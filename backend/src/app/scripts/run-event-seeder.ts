#!/usr/bin/env ts-node

import mongoose from 'mongoose';
import config from '../config';
import { seedEvents } from './seed-events';

async function runEventSeeding() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    if (!config.mongodb_uri) {
      throw new Error('Database URL not configured');
    }

    await mongoose.connect(config.mongodb_uri);
    console.log('✅ Connected to MongoDB');

    // Run event seeding
    await seedEvents();

    console.log('🎉 Event seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during event seeding:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding
runEventSeeding();