import { Types } from 'mongoose';
import { Attendance } from './attendance.model';
import { Student } from '../student/student.model';
import { Teacher } from '../teacher/teacher.model';
import { Subject } from '../subject/subject.model';
import { AppError } from '../../errors/AppError';
import { 
  ICreateAttendanceRequest, 
  IUpdateAttendanceRequest,
  IAttendanceResponse,
  IAttendanceStats,
  IStudentAttendanceReport,
  IClassAttendanceRequest,
  IAttendanceFilters
} from './attendance.interface';

export class AttendanceService {
  /**
   * Mark attendance for a class
   */
  static async markAttendance(
    teacherId: string,
    attendanceData: ICreateAttendanceRequest
  ): Promise<IAttendanceResponse[]> {
    // Validate teacher exists and is active
    const teacher = await Teacher.findById(teacherId).populate('schoolId userId');
    if (!teacher || !teacher.isActive) {
      throw new AppError(404, 'Teacher not found or inactive');
    }

    // Validate subject exists and teacher is assigned to it
    const subject = await Subject.findById(attendanceData.subjectId);
    if (!subject) {
      throw new AppError(404, 'Subject not found');
    }

    // Check if teacher is assigned to this subject
    const isAssigned = subject.teachers.some(id => id.toString() === teacherId);
    if (!isAssigned) {
      throw new AppError(403, 'Teacher is not assigned to this subject');
    }

    // Mark attendance
    const attendanceRecords = await Attendance.markAttendance(
      teacherId,
      attendanceData.classId,
      attendanceData.subjectId,
      new Date(attendanceData.date),
      attendanceData.period,
      attendanceData.attendanceData
    );

    // Populate and return formatted response
    const populatedRecords = await Attendance.populate(attendanceRecords, [
      {
        path: 'studentId',
        select: 'userId studentId rollNumber',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      },
      {
        path: 'teacherId',
        select: 'userId teacherId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      },
      {
        path: 'subjectId',
        select: 'name code'
      }
    ]);

    return this.formatAttendanceResponse(populatedRecords);
  }

  /**
   * Update existing attendance record
   */
  static async updateAttendance(
    attendanceId: string,
    userId: string,
    updateData: IUpdateAttendanceRequest
  ): Promise<IAttendanceResponse> {
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      throw new AppError(404, 'Attendance record not found');
    }

    // Check if attendance can be modified
    if (!attendance.canBeModified()) {
      throw new AppError(403, 'Attendance record is locked and cannot be modified');
    }

    // Update the attendance record
    if (updateData.status) {
      attendance.status = updateData.status;
    }
    
    if (updateData.modificationReason) {
      attendance.modificationReason = updateData.modificationReason;
    }

    attendance.modifiedAt = new Date();
    attendance.modifiedBy = new Types.ObjectId(userId);

    await attendance.save();

    // Populate and return
    await attendance.populate([
      {
        path: 'studentId',
        select: 'userId studentId rollNumber',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      },
      {
        path: 'teacherId',
        select: 'userId teacherId'
      },
      {
        path: 'subjectId',
        select: 'name code'
      }
    ]);

    return this.formatAttendanceResponse([attendance])[0];
  }

  /**
   * Get attendance by ID
   */
  static async getAttendanceById(attendanceId: string): Promise<IAttendanceResponse> {
    const attendance = await Attendance.findById(attendanceId)
      .populate({
        path: 'studentId',
        select: 'userId studentId rollNumber',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'teacherId',
        select: 'userId teacherId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('subjectId', 'name code');

    if (!attendance) {
      throw new AppError(404, 'Attendance record not found');
    }

    return this.formatAttendanceResponse([attendance])[0];
  }

  /**
   * Get class attendance for a specific date/period
   */
  static async getClassAttendance(
    request: IClassAttendanceRequest
  ): Promise<IAttendanceResponse[]> {
    const attendanceRecords = await Attendance.getClassAttendance(
      request.schoolId, // Using as classId for now
      new Date(request.date),
      request.period
    );

    return this.formatAttendanceResponse(attendanceRecords);
  }

  /**
   * Get student attendance history
   */
  static async getStudentAttendance(
    studentId: string,
    startDate: Date,
    endDate: Date,
    subjectId?: string
  ): Promise<IAttendanceResponse[]> {
    let attendanceRecords = await Attendance.getStudentAttendance(
      studentId,
      startDate,
      endDate
    );

    // Filter by subject if provided
    if (subjectId) {
      attendanceRecords = attendanceRecords.filter(
        record => record.subjectId.toString() === subjectId
      );
    }

    return this.formatAttendanceResponse(attendanceRecords);
  }

  /**
   * Get attendance statistics
   */
  static async getAttendanceStats(
    schoolId: string,
    startDate: Date,
    endDate: Date,
    filters?: IAttendanceFilters
  ): Promise<IAttendanceStats> {
    return await Attendance.getAttendanceStats(schoolId, startDate, endDate);
  }

  /**
   * Generate student attendance report
   */
  static async generateStudentAttendanceReport(
    studentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IStudentAttendanceReport> {
    const student = await Student.findById(studentId)
      .populate('userId', 'firstName lastName')
      .populate('schoolId', 'name');

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    const attendanceRecords = await Attendance.find({
      studentId,
      date: { $gte: startDate, $lte: endDate }
    }).populate('subjectId', 'name code');

    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter(
      record => record.status === 'present' || record.status === 'late'
    ).length;
    const absentClasses = attendanceRecords.filter(
      record => record.status === 'absent'
    ).length;
    const lateClasses = attendanceRecords.filter(
      record => record.status === 'late'
    ).length;
    const excusedClasses = attendanceRecords.filter(
      record => record.status === 'excused'
    ).length;

    // Calculate subject-wise attendance
    const subjectWiseAttendance = this.calculateSubjectWiseAttendance(attendanceRecords);
    
    // Calculate monthly trend
    const monthlyTrend = this.calculateMonthlyTrend(attendanceRecords);

    return {
      studentId,
      studentName: `${(student.userId as any).firstName} ${(student.userId as any).lastName}`,
      rollNumber: student.rollNumber || 0,
      grade: student.grade,
      section: student.section,
      totalClasses,
      presentClasses,
      absentClasses,
      lateClasses,
      excusedClasses,
      attendancePercentage: totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0,
      subjectWiseAttendance,
      monthlyTrend
    };
  }

  /**
   * Get attendance for multiple filters
   */
  static async getAttendanceByFilters(
    filters: IAttendanceFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    attendance: IAttendanceResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = {};

    // Apply filters
    if (filters.schoolId) query.schoolId = filters.schoolId;
    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.teacherId) query.teacherId = filters.teacherId;
    if (filters.classId) query.classId = filters.classId;
    if (filters.subjectId) query.subjectId = filters.subjectId;
    if (filters.status) query.status = filters.status;
    if (filters.period) query.period = filters.period;

    if (filters.date) {
      query.date = filters.date;
    } else if (filters.startDate && filters.endDate) {
      query.date = { $gte: filters.startDate, $lte: filters.endDate };
    }

    const total = await Attendance.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const attendanceRecords = await Attendance.find(query)
      .populate({
        path: 'studentId',
        select: 'userId studentId rollNumber',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'teacherId',
        select: 'userId teacherId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('subjectId', 'name code')
      .sort({ date: -1, period: 1 })
      .skip(skip)
      .limit(limit);

    return {
      attendance: this.formatAttendanceResponse(attendanceRecords),
      total,
      page,
      totalPages
    };
  }

  /**
   * Lock old attendance records
   */
  static async lockOldAttendance(): Promise<void> {
    await Attendance.lockOldAttendance();
  }

  /**
   * Format attendance records for response
   */
  private static formatAttendanceResponse(records: any[]): IAttendanceResponse[] {
    return records.map(record => ({
      id: record._id.toString(),
      schoolId: record.schoolId.toString(),
      studentId: record.studentId._id.toString(),
      teacherId: record.teacherId._id.toString(),
      subjectId: record.subjectId._id.toString(),
      classId: record.classId.toString(),
      date: record.date,
      period: record.period,
      status: record.status,
      markedAt: record.markedAt,
      modifiedAt: record.modifiedAt,
      modifiedBy: record.modifiedBy?.toString(),
      modificationReason: record.modificationReason,
      isLocked: record.isLocked,
      canModify: record.canBeModified(),
      timeSinceMarked: record.getTimeSinceMarked(),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      student: record.studentId ? {
        id: record.studentId._id.toString(),
        userId: record.studentId.userId._id.toString(),
        studentId: record.studentId.studentId,
        fullName: `${record.studentId.userId.firstName} ${record.studentId.userId.lastName}`,
        rollNumber: record.studentId.rollNumber || 0
      } : undefined,
      teacher: record.teacherId ? {
        id: record.teacherId._id.toString(),
        userId: record.teacherId.userId._id.toString(),
        teacherId: record.teacherId.teacherId,
        fullName: `${record.teacherId.userId.firstName} ${record.teacherId.userId.lastName}`
      } : undefined,
      subject: record.subjectId ? {
        id: record.subjectId._id.toString(),
        name: record.subjectId.name,
        code: record.subjectId.code
      } : undefined
    }));
  }

  /**
   * Calculate subject-wise attendance
   */
  private static calculateSubjectWiseAttendance(records: any[]): Array<{
    subjectId: string;
    subjectName: string;
    totalClasses: number;
    presentClasses: number;
    attendancePercentage: number;
  }> {
    const subjectMap = new Map();

    records.forEach(record => {
      const subjectId = record.subjectId._id.toString();
      const subjectName = record.subjectId.name;
      
      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, {
          subjectId,
          subjectName,
          totalClasses: 0,
          presentClasses: 0
        });
      }

      const subjectData = subjectMap.get(subjectId);
      subjectData.totalClasses++;
      
      if (record.status === 'present' || record.status === 'late') {
        subjectData.presentClasses++;
      }
    });

    return Array.from(subjectMap.values()).map(subject => ({
      ...subject,
      attendancePercentage: subject.totalClasses > 0 
        ? Math.round((subject.presentClasses / subject.totalClasses) * 100)
        : 0
    }));
  }

  /**
   * Calculate monthly attendance trend
   */
  private static calculateMonthlyTrend(records: any[]): Array<{
    month: string;
    year: number;
    totalClasses: number;
    presentClasses: number;
    attendancePercentage: number;
  }> {
    const monthMap = new Map();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    records.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = monthNames[date.getMonth()];
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: monthName,
          year: date.getFullYear(),
          totalClasses: 0,
          presentClasses: 0
        });
      }

      const monthData = monthMap.get(monthKey);
      monthData.totalClasses++;
      
      if (record.status === 'present' || record.status === 'late') {
        monthData.presentClasses++;
      }
    });

    return Array.from(monthMap.values())
      .map(month => ({
        ...month,
        attendancePercentage: month.totalClasses > 0 
          ? Math.round((month.presentClasses / month.totalClasses) * 100)
          : 0
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return monthNames.indexOf(b.month) - monthNames.indexOf(a.month);
      });
  }
}