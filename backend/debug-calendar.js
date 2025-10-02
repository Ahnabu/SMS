const mongoose = require('mongoose');

async function debugCalendar() {
  try {
    await mongoose.connect('mongodb+srv://school_management:ADFPgkUq8QYPx4oX@cluster0.cn1yph8.mongodb.net/school_management?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to Atlas database');
    
    // Check events collection
    const eventsCollection = mongoose.connection.db.collection('events');
    const events = await eventsCollection.find({}).toArray();
    console.log('\n📅 TOTAL EVENTS:', events.length);
    
    if (events.length > 0) {
      console.log('\n🎯 EVENT DETAILS:');
      events.forEach((event, index) => {
        console.log(`\nEvent ${index + 1}:`);
        console.log(`  Title: ${event.title}`);
        console.log(`  Target Audience:`, JSON.stringify(event.targetAudience, null, 2));
        console.log(`  Date: ${event.date}`);
        console.log(`  Active: ${event.isActive}`);
      });
    }
    
    // Check students collection  
    const studentsCollection = mongoose.connection.db.collection('students');
    const student = await studentsCollection.findOne({ userId: new mongoose.Types.ObjectId('68de1e892ff4ba32259c78db') });
    
    if (student) {
      console.log('\n👨‍🎓 STUDENT DETAILS:');
      console.log(`  Name: ${student.name}`);
      console.log(`  Grade: ${student.grade}`);
      console.log(`  Section: ${student.section}`);
      console.log(`  School ID: ${student.schoolId}`);
      
      // Check which events match this student
      console.log('\n🔍 MATCHING EVENTS:');
      const matchingEvents = events.filter(event => {
        const roles = event.targetAudience?.roles || [];
        const grades = event.targetAudience?.grades || [];
        const sections = event.targetAudience?.sections || [];
        
        const roleMatch = roles.includes('student');
        const gradeMatch = grades.length === 0 || grades.includes(student.grade);
        const sectionMatch = sections.length === 0 || sections.includes(student.section);
        
        console.log(`  ${event.title}:`);
        console.log(`    Role match (student): ${roleMatch}`);
        console.log(`    Grade match (${student.grade}): ${gradeMatch} - Event grades: [${grades.join(', ')}]`);
        console.log(`    Section match (${student.section}): ${sectionMatch} - Event sections: [${sections.join(', ')}]`);
        console.log(`    Overall match: ${roleMatch && gradeMatch && sectionMatch}`);
        
        return roleMatch && gradeMatch && sectionMatch;
      });
      
      console.log(`\n✅ MATCHING EVENTS COUNT: ${matchingEvents.length}`);
      matchingEvents.forEach(event => {
        console.log(`  - ${event.title}`);
      });
    } else {
      console.log('\n❌ Student not found');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugCalendar();