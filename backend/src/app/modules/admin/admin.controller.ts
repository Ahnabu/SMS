import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { Student } from '../student/student.model';
import { Teacher } from '../teacher/teacher.model';
import { Subject } from '../subject/subject.model';
import { Schedule } from '../schedule/schedule.model';
import { AcademicCalendar } from '../academic-calendar/academic-calendar.model';
import { AppError } from '../../errors/AppError';
import { AuthenticatedRequest } from '../../middlewares/auth';

// Dashboard controller
export const getAdminDashboard = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const adminSchoolId = req.user?.schoolId;

  if (!adminSchoolId) {
    return next(new AppError(400, 'School ID not found in user context'));
  }

  // Convert schoolId to ObjectId for proper querying
  const schoolObjectId = new mongoose.Types.ObjectId(adminSchoolId);

  // Fetch dashboard statistics for admin's school
  const [
    totalStudents,
    totalTeachers,
    totalSubjects,
    totalSchedules,
    upcomingEvents
  ] = await Promise.all([
    Student.countDocuments({ schoolId: schoolObjectId, isActive: true }),
    Teacher.countDocuments({ schoolId: schoolObjectId, isActive: true }),
    Subject.countDocuments({ schoolId: schoolObjectId, isActive: true }),
    Schedule.countDocuments({ schoolId: schoolObjectId, isActive: true })
      .catch(() => 0), // Return 0 if Schedule model doesn't exist or has issues
    AcademicCalendar.find({ 
      schoolId: schoolObjectId, 
      isActive: true,
      startDate: { $gte: new Date() }
    })
    .sort({ startDate: 1 })
    .limit(5)
    .catch(() => []) // Return empty array if model doesn't exist or has issues
  ]);

  const dashboardData = {
    totalStudents,
    totalTeachers,
    totalSubjects,
    activeClasses: totalSchedules, // Map totalSchedules to activeClasses for frontend consistency
    upcomingEvents: upcomingEvents.length,
    upcomingEventsDetails: upcomingEvents
  };

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Admin dashboard data retrieved successfully',
    data: dashboardData
  });
});

// Schedule controllers
export const createSchedule = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const adminSchoolId = req.user?.schoolId;
  
  if (!adminSchoolId) {
    return next(new AppError(400, 'School ID not found in user context'));
  }

  const scheduleData = {
    ...req.body,
    schoolId: adminSchoolId,
    createdBy: req.user?.id
  };

  const schedule = await Schedule.create(scheduleData);
  const populatedSchedule = await Schedule.findById(schedule._id)
    .populate('subjectId')
    .populate('teacherId')
    .populate('classId');

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Schedule created successfully',
    data: populatedSchedule
  });
});

export const getAllSchedules = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const adminSchoolId = req.user?.schoolId;
  
  if (!adminSchoolId) {
    return next(new AppError(400, 'School ID not found in user context'));
  }

  const schedules = await Schedule.find({ schoolId: adminSchoolId, isDeleted: false })
    .populate('subjectId')
    .populate('teacherId')
    .populate('classId')
    .sort({ createdAt: -1 });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Schedules retrieved successfully',
    data: schedules
  });
});

export const getScheduleById = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const adminSchoolId = req.user?.schoolId;
  
  const schedule = await Schedule.findOne({ 
    _id: id, 
    schoolId: adminSchoolId, 
    isDeleted: false 
  })
    .populate('subjectId')
    .populate('teacherId')
    .populate('classId');

  if (!schedule) {
    return next(new AppError(404, 'Schedule not found'));
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Schedule retrieved successfully',
    data: schedule
  });
});

export const updateSchedule = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const adminSchoolId = req.user?.schoolId;
  
  const schedule = await Schedule.findOneAndUpdate(
    { _id: id, schoolId: adminSchoolId, isDeleted: false },
    { ...req.body, updatedBy: req.user?.id },
    { new: true }
  )
    .populate('subjectId')
    .populate('teacherId')
    .populate('classId');

  if (!schedule) {
    return next(new AppError(404, 'Schedule not found'));
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Schedule updated successfully',
    data: schedule
  });
});

export const deleteSchedule = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const adminSchoolId = req.user?.schoolId;
  
  const schedule = await Schedule.findOneAndUpdate(
    { _id: id, schoolId: adminSchoolId, isDeleted: false },
    { 
      isDeleted: true, 
      deletedAt: new Date(),
      deletedBy: req.user?.id
    },
    { new: true }
  );

  if (!schedule) {
    return next(new AppError(404, 'Schedule not found'));
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Schedule deleted successfully',
    data: null
  });
});

// Calendar controllers
export const createCalendarEvent = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const adminSchoolId = req.user?.schoolId;
  
  if (!adminSchoolId) {
    return next(new AppError(400, 'School ID not found in user context'));
  }

  const eventData = {
    ...req.body,
    schoolId: adminSchoolId,
    createdBy: req.user?.id
  };

  const event = await AcademicCalendar.create(eventData);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Calendar event created successfully',
    data: event
  });
});

export const getAllCalendarEvents = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const adminSchoolId = req.user?.schoolId;
  
  if (!adminSchoolId) {
    return next(new AppError(400, 'School ID not found in user context'));
  }

  const events = await AcademicCalendar.find({ 
    schoolId: adminSchoolId, 
    isDeleted: false 
  }).sort({ startDate: 1 });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Calendar events retrieved successfully',
    data: events
  });
});

export const getCalendarEventById = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const adminSchoolId = req.user?.schoolId;
  
  const event = await AcademicCalendar.findOne({ 
    _id: id, 
    schoolId: adminSchoolId, 
    isDeleted: false 
  });

  if (!event) {
    return next(new AppError(404, 'Calendar event not found'));
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Calendar event retrieved successfully',
    data: event
  });
});

export const updateCalendarEvent = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const adminSchoolId = req.user?.schoolId;
  
  const event = await AcademicCalendar.findOneAndUpdate(
    { _id: id, schoolId: adminSchoolId, isDeleted: false },
    { ...req.body, updatedBy: req.user?.id },
    { new: true }
  );

  if (!event) {
    return next(new AppError(404, 'Calendar event not found'));
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Calendar event updated successfully',
    data: event
  });
});

export const deleteCalendarEvent = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const adminSchoolId = req.user?.schoolId;
  
  const event = await AcademicCalendar.findOneAndUpdate(
    { _id: id, schoolId: adminSchoolId, isDeleted: false },
    { 
      isDeleted: true, 
      deletedAt: new Date(),
      deletedBy: req.user?.id
    },
    { new: true }
  );

  if (!event) {
    return next(new AppError(404, 'Calendar event not found'));
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Calendar event deleted successfully',
    data: null
  });
});