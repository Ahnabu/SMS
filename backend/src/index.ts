import { Request, Response } from 'express';
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
    // Don't throw, allow app to handle DB errors gracefully
  }
};

// Vercel serverless function handler
export default async (req: Request, res: Response) => {
  // Ensure DB is connected before handling request
  await connectDB();
  
  // Pass request to Express app
  return app(req, res);
};
