const { MongoClient } = require('mongodb');

async function cleanupSchools() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('school_management');
    
    // Drop the entire schools collection
    try {
      await db.collection('schools').drop();
      console.log('Dropped schools collection completely');
    } catch (e) {
      console.log('Schools collection might not exist:', e.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

cleanupSchools();