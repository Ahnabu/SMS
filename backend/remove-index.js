const { MongoClient } = require('mongodb');

async function removeAdminUsernameIndex() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('school_management');
    const collection = db.collection('schools');
    
    // Drop the adminUsername index completely
    try {
      await collection.dropIndex('adminUsername_1');
      console.log('Dropped adminUsername_1 index');
    } catch (e) {
      console.log('Index might not exist:', e.message);
    }
    
    // List remaining indexes
    const indexes = await collection.listIndexes().toArray();
    console.log('Remaining indexes:');
    indexes.forEach(index => {
      console.log(`  ${index.name}:`, index.key);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

removeAdminUsernameIndex();