const mongoose = require('mongoose');

async function testStudentCalendar() {
  try {
    await mongoose.connect('mongodb+srv://school_management:ADFPgkUq8QYPx4oX@cluster0.cn1yph8.mongodb.net/school_management?retryWrites=true&w=majority&appName=Cluster0');
    console.log('🔗 Connected to Atlas database');
    
    // Use direct MongoDB collections instead of models
    const studentsCollection = mongoose.connection.db.collection('students');
    const eventsCollection = mongoose.connection.db.collection('events');
    
    // Find the student
    const student = await studentsCollection.findOne({ 
      userId: new mongoose.Types.ObjectId('68de1e892ff4ba32259c78db') 
    });
    
    if (!student) {
      console.log('❌ Student not found');
      return;
    }
    
    console.log(`\n👨‍🎓 Testing calendar for student: ${student.name || 'Unknown'}`);
    console.log(`   Grade: ${student.grade}, Section: ${student.section}`);
    
    // Test the new query logic
    const query = {
      isActive: true,
      'targetAudience.roles': { $in: ['student'] }
    };
    
    // Apply the fixed grade/section filtering
    const gradeConditions = [
      { 'targetAudience.grades': { $size: 0 } }, // Empty array = all grades
      { 'targetAudience.grades': { $in: [student.grade] } } // Specific grade included
    ];
    
    const sectionConditions = [
      { 'targetAudience.sections': { $size: 0 } }, // Empty array = all sections
      { 'targetAudience.sections': { $in: [student.section] } } // Specific section included
    ];
    
    // Combine conditions
    query.$and = [
      { $or: gradeConditions },
      { $or: sectionConditions }
    ];
    
    console.log('\n🔍 Using query:', JSON.stringify(query, null, 2));
    
    const events = await eventsCollection.find(query).toArray();
    console.log(`\n✅ Found ${events.length} events for this student:`);
    
    events.forEach(event => {
      console.log(`   📅 ${event.title} - ${new Date(event.date).toDateString()}`);
    });
    
    // Test today's events specifically
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    const todayQuery = {
      ...query,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    };
    
    const todaysEvents = await eventsCollection.find(todayQuery).toArray();
    console.log(`\n🗓️ Today's events (${today.toDateString()}): ${todaysEvents.length}`);
    todaysEvents.forEach(event => {
      console.log(`   📅 ${event.title} at ${event.time || 'No time specified'}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testStudentCalendar();