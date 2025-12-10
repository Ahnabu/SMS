import app from './app';
import config from './app/config';
import { database } from './app/DB';

// Connect to MongoDB
database.connect().catch((error) => {
  console.error('❌ Failed to connect to database:', error);
});

// Handle Vercel serverless function
export default app;
