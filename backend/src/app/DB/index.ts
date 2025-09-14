import mongoose from 'mongoose';
import config from '../config';

class Database {
  private static instance: Database;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      // MongoDB connection options
      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
      };

      await mongoose.connect(config.mongodb_uri, options);

      // Connection event handlers
      mongoose.connection.on('connected', () => {
        console.log('✅ Mongoose connected to MongoDB');
      });

      mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ Mongoose disconnected from MongoDB');
      });

      // Handle application termination
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed successfully');
    } catch (error) {
      console.error('❌ Error while disconnecting from MongoDB:', error);
    }
  }

  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }

  public async dropDatabase(): Promise<void> {
    if (config.node_env === 'test') {
      await mongoose.connection.dropDatabase();
      console.log('🗑️ Test database dropped');
    } else {
      throw new Error('Database drop is only allowed in test environment');
    }
  }

  public async clearCollections(): Promise<void> {
    if (config.node_env === 'test') {
      const collections = mongoose.connection.collections;

      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
      console.log('🧹 Test collections cleared');
    } else {
      throw new Error('Collection clearing is only allowed in test environment');
    }
  }

  public isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

// Export singleton instance
export const database = Database.getInstance();

// Export mongoose for direct usage if needed
export { mongoose };

// Default export
export default database;