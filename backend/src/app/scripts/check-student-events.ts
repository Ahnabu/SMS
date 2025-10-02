import Database from '../DB';
import { Student } from '../modules/student/student.model';
import { Event } from '../modules/event/event.model';

async function checkStudentEvents() {
  try {
    await Database.connect();
    
    console.log('🔍 Checking student data...');
    const student = await Student.findById('68de1e892ff4ba32259c78db');
    
    if (!student) {
      console.log('❌ Student not found');
      return;
    }
    
    console.log('👤 Student details:', {
      id: student._id,
      name: (student as any).firstName + ' ' + (student as any).lastName,
      grade: student.grade,
      section: student.section,
      schoolId: student.schoolId
    });
    
    console.log('\n📅 Checking events...');
    const allEvents = await Event.find({ isActive: true });
    console.log(`Total active events: ${allEvents.length}`);
    
    if (allEvents.length > 0) {
      console.log('\n🎯 Sample events:');
      allEvents.slice(0, 3).forEach(event => {
        console.log(`- ${event.title}:`);
        console.log(`  Type: ${event.type}`);
        console.log(`  Date: ${event.date}`);
        console.log(`  Target roles: ${event.targetAudience.roles}`);
        console.log(`  Target grades: ${event.targetAudience.grades || 'All grades'}`);
        console.log(`  Target sections: ${event.targetAudience.sections || 'All sections'}`);
        console.log(`  School: ${event.schoolId}`);
      });
    }
    
    // Check events matching student
    const studentEvents = await Event.find({
      isActive: true,
      'targetAudience.roles': { $in: ['student'] },
      $or: [
        { 'targetAudience.grades': { $in: [student.grade] } },
        { 'targetAudience.grades': { $exists: false } },
        { 'targetAudience.grades': { $size: 0 } }
      ]
    });
    
    console.log(`\n✅ Events matching student (grade ${student.grade}): ${studentEvents.length}`);
    studentEvents.forEach(event => {
      console.log(`- ${event.title} (${event.type})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkStudentEvents();