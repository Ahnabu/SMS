import { Schema, model, Types } from 'mongoose';
import config from '../../config';
import {
  IAttendance,
  IAttendanceDocument,
  IAttendanceMethods,
  IAttendanceModel,
  IMarkAttendanceData,
  IAttendanceStats
} from './attendance.interface';

// Attendance schema definition
const attendanceSchema = new Schema<IAttendanceDocument, IAttendanceModel, IAttendanceMethods>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher ID is required'],
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class', // Assuming a Class model exists or will be created
      required: [true, 'Class ID is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
      validate: {
        validator: function (date: Date) {
          // Cannot mark attendance for future dates beyond tomorrow
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(23, 59, 59, 999);
          return date <= tomorrow;
        },
        message: 'Cannot mark attendance for dates beyond tomorrow',
      },
    },
    period: {
      type: Number,
      required: [true, 'Period is required'],
      min: [1, 'Period must be at least 1'],
      max: [config.max_periods_per_day || 8, 'Period cannot exceed maximum periods per day'],
      index: true,
    },
    status: {
      type: String,
      required: [true, 'Attendance status is required'],
      enum: {
        values: ['present', 'absent', 'late', 'excused'],
        message: 'Status must be present, absent, late, or excused',
      },
      index: true,
    },
    markedAt: {
      type: Date,
      required: [true, 'Marked at time is required'],
      default: Date.now,
    },
    modifiedAt: {
      type: Date,
    },
    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    modificationReason: {
      type: String,
      maxlength: [200, 'Modification reason cannot exceed 200 characters'],
    },
    isLocked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Instance methods
attendanceSchema.methods.canBeModified = function (): boolean {
  if (this.isLocked) {
    return false;
  }

  // Check if within modification time limit (default 2 hours)
  const maxEditTime = (config.max_attendance_edit_hours || 2) * 60 * 60 * 1000;
  const now = new Date();
  const markedTime = this.modifiedAt || this.markedAt;
  const timeDiff = now.getTime() - markedTime.getTime();

  return timeDiff <= maxEditTime;
};

attendanceSchema.methods.lockAttendance = function (): void {
  this.isLocked = true;
};

attendanceSchema.methods.getStatusIcon = function (): string {
  const icons = {
    present: '✅',
    absent: '❌',
    late: '⏰',
    excused: '📝'
  };
  return icons[this.status] || '❓';
};

attendanceSchema.methods.getTimeSinceMarked = function (): number {
  const now = new Date();
  const markedTime = this.modifiedAt || this.markedAt;
  return Math.floor((now.getTime() - markedTime.getTime()) / (1000 * 60)); // Minutes
};

// Static methods
attendanceSchema.statics.markAttendance = async function (
  teacherId: string,
  classId: string,
  subjectId: string,
  date: Date,
  period: number,
  attendanceData: IMarkAttendanceData[]
): Promise<IAttendanceDocument[]> {
  const results: IAttendanceDocument[] = [];
  
  // Get the school ID from the teacher
  const Teacher = model('Teacher');
  const teacher = await Teacher.findById(teacherId).populate('schoolId');
  if (!teacher) {
    throw new Error('Teacher not found');
  }

  for (const data of attendanceData) {
    const existingAttendance = await this.findOne({
      studentId: data.studentId,
      date,
      period,
      subjectId,
    });

    if (existingAttendance) {
      // Update existing attendance if it can be modified
      if (existingAttendance.canBeModified()) {
        existingAttendance.status = data.status;
        existingAttendance.modifiedAt = new Date();
        existingAttendance.modifiedBy = new Types.ObjectId(teacherId);
        await existingAttendance.save();
        results.push(existingAttendance);
      } else {
        throw new Error(`Attendance for student ${data.studentId} is locked and cannot be modified`);
      }
    } else {
      // Create new attendance record
      const newAttendance = new this({
        schoolId: teacher.schoolId,
        studentId: data.studentId,
        teacherId,
        subjectId,
        classId,
        date,
        period,
        status: data.status,
        markedAt: new Date(),
      });

      await newAttendance.save();
      results.push(newAttendance);
    }
  }

  return results;
};

attendanceSchema.statics.getClassAttendance = function (
  classId: string,
  date: Date,
  period?: number
): Promise<IAttendanceDocument[]> {
  const query: any = { classId, date };
  if (period) {
    query.period = period;
  }

  return this.find(query)
    .populate('studentId', 'userId studentId rollNumber')
    .populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'firstName lastName'
      }
    })
    .populate('teacherId', 'userId teacherId')
    .populate('subjectId', 'name code')
    .sort({ period: 1, 'studentId.rollNumber': 1 });
};

attendanceSchema.statics.getStudentAttendance = function (
  studentId: string,
  startDate: Date,
  endDate: Date
): Promise<IAttendanceDocument[]> {
  return this.find({
    studentId,
    date: { $gte: startDate, $lte: endDate },
  })
    .populate('teacherId', 'userId teacherId')
    .populate('subjectId', 'name code')
    .sort({ date: -1, period: 1 });
};

attendanceSchema.statics.calculateAttendancePercentage = async function (
  studentId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const attendanceRecords = await this.find({
    studentId,
    date: { $gte: startDate, $lte: endDate },
  });

  if (attendanceRecords.length === 0) {
    return 0;
  }

  const presentCount = attendanceRecords.filter(
    record => record.status === 'present' || record.status === 'late'
  ).length;

  return Math.round((presentCount / attendanceRecords.length) * 100);
};

attendanceSchema.statics.getAttendanceStats = async function (
  schoolId: string,
  startDate: Date,
  endDate: Date
): Promise<IAttendanceStats> {
  const pipeline = [
    {
      $match: {
        schoolId: schoolId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
        },
        absentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] },
        },
        lateCount: {
          $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] },
        },
        excusedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] },
        },
      },
    },
  ];

  const results = await this.aggregate(pipeline);
  const stats = results[0] || {
    totalRecords: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 0,
  };

  const totalStudents = await model('Student').countDocuments({ schoolId });
  const attendancePercentage = stats.totalRecords > 0 
    ? Math.round(((stats.presentCount + stats.lateCount) / stats.totalRecords) * 100)
    : 0;

  return {
    totalClasses: stats.totalRecords,
    totalStudents,
    presentCount: stats.presentCount,
    absentCount: stats.absentCount,
    lateCount: stats.lateCount,
    excusedCount: stats.excusedCount,
    attendancePercentage,
    byStatus: [
      {
        status: 'present',
        count: stats.presentCount,
        percentage: stats.totalRecords > 0 ? Math.round((stats.presentCount / stats.totalRecords) * 100) : 0,
      },
      {
        status: 'absent',
        count: stats.absentCount,
        percentage: stats.totalRecords > 0 ? Math.round((stats.absentCount / stats.totalRecords) * 100) : 0,
      },
      {
        status: 'late',
        count: stats.lateCount,
        percentage: stats.totalRecords > 0 ? Math.round((stats.lateCount / stats.totalRecords) * 100) : 0,
      },
      {
        status: 'excused',
        count: stats.excusedCount,
        percentage: stats.totalRecords > 0 ? Math.round((stats.excusedCount / stats.totalRecords) * 100) : 0,
      },
    ],
    byGrade: [], // Will be implemented with grade-wise aggregation if needed
    dailyTrend: [], // Will be implemented with daily aggregation if needed
  };
};

attendanceSchema.statics.lockOldAttendance = async function (): Promise<void> {
  const lockAfterDays = config.attendance_lock_after_days || 7;
  const lockDate = new Date();
  lockDate.setDate(lockDate.getDate() - lockAfterDays);

  await this.updateMany(
    {
      date: { $lt: lockDate },
      isLocked: false,
    },
    {
      $set: { isLocked: true },
    }
  );
};

// Indexes for performance
attendanceSchema.index({ schoolId: 1, date: -1 });
attendanceSchema.index({ studentId: 1, date: -1 });
attendanceSchema.index({ classId: 1, date: 1, period: 1 });
attendanceSchema.index({ teacherId: 1, date: -1 });
attendanceSchema.index({ date: 1, period: 1 });
attendanceSchema.index({ studentId: 1, date: 1, period: 1, subjectId: 1 }, { unique: true });

// Pre-save middleware
attendanceSchema.pre('save', function (next) {
  // Auto-lock attendance after modification time limit
  if (!this.isNew && this.isModified('status')) {
    this.modifiedAt = new Date();
  }

  // Normalize date to start of day
  if (this.isModified('date')) {
    this.date.setHours(0, 0, 0, 0);
  }

  next();
});

// Transform for JSON output
attendanceSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    (ret as any).canModify = doc.canBeModified();
    (ret as any).timeSinceMarked = doc.getTimeSinceMarked();
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});

// Export the model
export const Attendance = model<IAttendanceDocument, IAttendanceModel>('Attendance', attendanceSchema);