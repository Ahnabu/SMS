const { MongoClient } = require('mongodb');

async function fixIndex() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('school_management');
    const collection = db.collection('schools');
    
    // Drop the problematic index
    try {
      await collection.dropIndex('adminUsername_1');
      console.log('Dropped adminUsername_1 index');
    } catch (e) {
      console.log('Index might not exist:', e.message);
    }
    
    // Remove all documents (clean slate)
    const result = await collection.deleteMany({});
    console.log(`Deleted ${result.deletedCount} school documents`);
    
    // Recreate the index as sparse
    await collection.createIndex({ adminUsername: 1 }, { sparse: true });
    console.log('Recreated adminUsername index as sparse');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

fixIndex();