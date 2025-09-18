const { MongoClient } = require('mongodb');

async function checkSchools() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('school_management');
    const collection = db.collection('schools');
    
    // Check all documents
    const schools = await collection.find({}).toArray();
    console.log('Found schools:', schools.length);
    schools.forEach((school, index) => {
      console.log(`School ${index + 1}:`, {
        id: school._id,
        name: school.name,
        adminUsername: school.adminUsername,
        adminUserId: school.adminUserId
      });
    });
    
    // Check indexes
    const indexes = await collection.listIndexes().toArray();
    console.log('Indexes:');
    indexes.forEach(index => {
      console.log(`  ${index.name}:`, index.key, index.sparse ? '(sparse)' : '');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

checkSchools();