import app from './app';
import { database } from './app/DB';

// Connect to MongoDB once (cached across serverless function invocations)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await database.connect();
    isConnected = true;
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }
};

// Initialize DB connection
connectDB();

// Export for Vercel serverless
export default app;
