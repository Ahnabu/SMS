# Academic Calendar & Schedule Management System

This document provides comprehensive information about the Academic Calendar and Schedule Management system implemented for the School Management System (SMS).

## 🎯 Overview

The system provides three core modules:

1. **Academic Calendar** - Global school events, holidays, exams, and special occasions
2. **Schedule Management** - Class timetables, period management, and teacher assignments
3. **Subject Management** - Subject creation and management for scheduling

## 📚 Academic Calendar Module

### Features

- **Event Management**: Create, read, update, delete calendar events
- **Event Types**: Holiday, exam, meeting, event, sports, cultural, parent-teacher, other
- **Exam Scheduling**: Comprehensive exam period and individual subject exam scheduling
- **Target Audience**: Specific targeting for grades, classes, teachers, students, parents
- **Recurrence**: Support for recurring events (daily, weekly, monthly, yearly)
- **Attachments**: File attachments for events
- **Statistics**: Calendar analytics and reporting

### API Endpoints

#### Calendar Events

```
POST   /api/calendar                    - Create calendar event
GET    /api/calendar                    - Get all calendar events (with filters)
GET    /api/calendar/:id                - Get specific calendar event
PATCH  /api/calendar/:id                - Update calendar event
DELETE /api/calendar/:id                - Delete calendar event
GET    /api/calendar/stats/:schoolId    - Get calendar statistics
```

#### Specialized Views

```
GET    /api/calendar/monthly/:schoolId/:year/:month  - Monthly calendar view
GET    /api/calendar/upcoming/:schoolId              - Upcoming events
```

#### Exam Scheduling

```
POST   /api/calendar/exam-schedule      - Create comprehensive exam schedule
```

### Example: Creating an Exam Schedule

```json
{
  "title": "Mid-Term Examinations 2024",
  "description": "Second quarter mid-term examinations for all grades",
  "examType": "midterm",
  "schoolId": "673123456789012345678901",
  "organizerId": "673123456789012345678902",
  "startDate": "2024-03-15",
  "endDate": "2024-03-25",
  "grades": ["9", "10", "11", "12"],
  "examSchedule": [
    {
      "subjectId": "673123456789012345678903",
      "subjectName": "Mathematics",
      "date": "2024-03-16",
      "startTime": "09:00",
      "endTime": "11:00",
      "duration": 120,
      "totalMarks": 100,
      "room": "Room 101",
      "supervisor": "John Smith"
    }
  ],
  "status": "published"
}
```

## 📅 Schedule Management Module

### Features

- **Class Scheduling**: Create detailed timetables for each class and day
- **Period Management**: Flexible period timing with breaks
- **Teacher Assignment**: Assign teachers to specific periods/subjects
- **Substitute Teachers**: Temporary and permanent teacher replacements
- **Conflict Detection**: Automatic teacher conflict resolution
- **Weekly Overview**: Complete weekly schedule generation
- **Teacher Workload**: Teacher schedule analysis and workload distribution
- **Statistics**: Comprehensive scheduling analytics

### API Endpoints

#### Core Schedule Management

```
POST   /api/schedules                                  - Create schedule
POST   /api/schedules/bulk                            - Bulk create schedules
GET    /api/schedules                                  - Get all schedules (with filters)
GET    /api/schedules/:id                             - Get specific schedule
PATCH  /api/schedules/:id                             - Update schedule
DELETE /api/schedules/:id                             - Delete schedule
```

#### Specialized Views

```
GET    /api/schedules/weekly/:schoolId/:grade/:section           - Weekly class schedule
GET    /api/schedules/class/:schoolId/:grade/:section            - Class schedules
GET    /api/schedules/teacher/:teacherId                         - Teacher workload
GET    /api/schedules/teacher/:teacherId/schedules               - Teacher schedules
GET    /api/schedules/subject/:subjectId                         - Subject schedules
GET    /api/schedules/school/:schoolId/overview                  - School overview
GET    /api/schedules/stats/:schoolId                            - Schedule statistics
```

#### Teacher Management

```
PATCH  /api/schedules/:scheduleId/substitute/:periodNumber      - Assign substitute teacher
```

### Example: Creating a Daily Schedule

```json
{
  "schoolId": "673123456789012345678901",
  "classId": "673123456789012345678904",
  "grade": 9,
  "section": "A",
  "academicYear": "2024-2025",
  "dayOfWeek": "monday",
  "periods": [
    {
      "periodNumber": 1,
      "subjectId": "673123456789012345678903",
      "teacherId": "673123456789012345678905",
      "roomNumber": "101",
      "startTime": "08:00",
      "endTime": "08:45",
      "isBreak": false
    },
    {
      "periodNumber": 2,
      "startTime": "08:45",
      "endTime": "09:00",
      "isBreak": true,
      "breakType": "short",
      "breakDuration": 15
    }
  ]
}
```

## 📖 Subject Management Module

### Features

- **Subject CRUD**: Create, read, update, delete subjects
- **Grade Association**: Link subjects to specific grades
- **Teacher Assignment**: Associate teachers with subjects
- **Schedule Integration**: Full integration with schedule system

### API Endpoints

```
POST   /api/subjects        - Create subject
GET    /api/subjects        - Get all subjects (with filters)
GET    /api/subjects/:id    - Get specific subject
PATCH  /api/subjects/:id    - Update subject
DELETE /api/subjects/:id    - Delete subject
```

### Example: Creating a Subject

```json
{
  "name": "Advanced Mathematics",
  "code": "MATH-ADV",
  "description": "Advanced mathematics for grade 11-12",
  "grades": [11, 12],
  "schoolId": "673123456789012345678901",
  "teachers": ["673123456789012345678905"],
  "isActive": true
}
```

## 🔐 Authentication & Authorization

All endpoints require authentication and role-based access control:

### Permission Matrix

| Feature                    | Superadmin | Admin | Teacher | Student | Parent | Accountant |
| -------------------------- | ---------- | ----- | ------- | ------- | ------ | ---------- |
| Create Events/Schedules    | ✅         | ✅    | ❌      | ❌      | ❌     | ❌         |
| View Events/Schedules      | ✅         | ✅    | ✅      | ✅      | ✅     | ✅         |
| Update Events/Schedules    | ✅         | ✅    | ❌      | ❌      | ❌     | ❌         |
| Delete Events/Schedules    | ✅         | ✅    | ❌      | ❌      | ❌     | ❌         |
| Assign Substitute Teachers | ✅         | ✅    | ❌      | ❌      | ❌     | ❌         |
| View Statistics            | ✅         | ✅    | ❌      | ❌      | ❌     | ❌         |

## 🏗️ Architecture

### Database Models

#### Academic Calendar

- **AcademicCalendar**: Main calendar events model
- Supports event types, recurrence, attachments, target audiences
- Integrated exam scheduling with detailed timing and marks

#### Schedule

- **Schedule**: Daily class schedules with periods
- Conflict detection and teacher availability checking
- Support for breaks, substitute teachers, and room assignments

#### Subject

- **Subject**: Subject definitions with grade associations
- Teacher assignments and integration with schedule system

### Key Features

#### 1. Conflict Detection

- Automatic teacher availability checking
- Time overlap detection for periods
- Validation of school hour boundaries

#### 2. Comprehensive Filtering

- Filter by school, grade, section, day, teacher, subject
- Date range filtering for calendar events
- Academic year filtering

#### 3. Statistics & Analytics

- Calendar event statistics by type and frequency
- Teacher workload analysis and utilization
- Subject distribution across classes
- Schedule coverage and gaps analysis

#### 4. Bulk Operations

- Bulk schedule creation for efficient setup
- Batch event creation for holidays and exam periods

## 🚀 Usage Examples

### 1. Setting up a School Calendar

```javascript
// Create holiday periods
const holidays = await fetch("/api/calendar", {
  method: "POST",
  body: JSON.stringify({
    title: "Winter Break 2024",
    eventType: "holiday",
    startDate: "2024-12-20",
    endDate: "2024-01-02",
    isAllDay: true,
    schoolId: schoolId,
    organizerId: adminId,
    targetAudience: { allSchool: true },
  }),
});

// Create exam schedule
const examSchedule = await fetch("/api/calendar/exam-schedule", {
  method: "POST",
  body: JSON.stringify({
    title: "Final Examinations",
    examType: "final",
    startDate: "2024-05-15",
    endDate: "2024-05-30",
    grades: ["9", "10", "11", "12"],
    examSchedule: [
      /* detailed exam schedule */
    ],
  }),
});
```

### 2. Creating Weekly Class Schedule

```javascript
// Create Monday schedule for Grade 9A
const mondaySchedule = await fetch("/api/schedules", {
  method: "POST",
  body: JSON.stringify({
    schoolId: schoolId,
    grade: 9,
    section: "A",
    dayOfWeek: "monday",
    periods: [
      {
        periodNumber: 1,
        subjectId: mathSubjectId,
        teacherId: mathTeacherId,
        startTime: "08:00",
        endTime: "08:45",
      },
      // ... more periods
    ],
  }),
});

// Get complete weekly schedule
const weeklySchedule = await fetch(`/api/schedules/weekly/${schoolId}/9/A`);
```

### 3. Teacher Workload Management

```javascript
// Get teacher's complete workload
const teacherWorkload = await fetch(`/api/schedules/teacher/${teacherId}`);

// Assign substitute teacher
const substitute = await fetch(`/api/schedules/${scheduleId}/substitute/3`, {
  method: "PATCH",
  body: JSON.stringify({
    substituteTeacherId: substituteId,
    startDate: "2024-03-15",
    endDate: "2024-03-20",
    reason: "Regular teacher on medical leave",
  }),
});
```

## 📊 Frontend Integration

The backend is ready for frontend integration with comprehensive APIs for:

1. **Calendar Components**: Monthly views, event lists, exam schedules
2. **Schedule Components**: Weekly timetables, teacher schedules, class schedules
3. **Administrative Panels**: Event creation, schedule management, teacher assignments
4. **Analytics Dashboards**: Statistics, workload analysis, utilization reports

## 🎯 Key Benefits

1. **Comprehensive School Management**: Complete calendar and scheduling solution
2. **Conflict Prevention**: Automatic detection and prevention of scheduling conflicts
3. **Flexible Architecture**: Extensible design for future enhancements
4. **Role-Based Access**: Secure access control for different user types
5. **Rich Analytics**: Detailed insights into school operations
6. **User-Friendly APIs**: Well-designed endpoints for frontend integration

## 🔄 Next Steps

1. **Frontend Components**: Create React components for calendar and scheduling
2. **Notifications**: Implement notification system for schedule changes
3. **Mobile App**: Extend to mobile applications
4. **Reporting**: Advanced reporting and export features
5. **Integration**: Connect with attendance and grading systems

This system provides a solid foundation for comprehensive school calendar and schedule management with room for future enhancements and integrations.
