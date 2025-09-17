import { Document, Types, Model } from 'mongoose';

export interface IAttendance {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  teacherId: Types.ObjectId;
  subjectId: Types.ObjectId;
  classId: Types.ObjectId; // Grade + Section combination
  date: Date;
  period: number; // 1-8
  status: 'present' | 'absent' | 'late' | 'excused';
  markedAt: Date;
  modifiedAt?: Date;
  modifiedBy?: Types.ObjectId; // User who modified
  modificationReason?: string;
  isLocked: boolean; // Cannot be modified after certain time
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAttendanceDocument extends IAttendance, Document, IAttendanceMethods {
  _id: Types.ObjectId;
}

export interface IAttendanceMethods {
  canBeModified(): boolean;
  lockAttendance(): void;
  getStatusIcon(): string;
  getTimeSinceMarked(): number; // Minutes
}

export interface IAttendanceModel extends Model<IAttendanceDocument> {
  markAttendance(
    teacherId: string,
    classId: string,
    subjectId: string,
    date: Date,
    period: number,
    attendanceData: IMarkAttendanceData[]
  ): Promise<IAttendanceDocument[]>;
  getClassAttendance(
    classId: string,
    date: Date,
    period?: number
  ): Promise<IAttendanceDocument[]>;
  getStudentAttendance(
    studentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IAttendanceDocument[]>;
  calculateAttendancePercentage(
    studentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number>;
  getAttendanceStats(
    schoolId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IAttendanceStats>;
  lockOldAttendance(): Promise<void>;
}

export interface IMarkAttendanceData {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface ICreateAttendanceRequest {
  classId: string;
  subjectId: string;
  date: string; // ISO date string
  period: number;
  attendanceData: IMarkAttendanceData[];
}

export interface IUpdateAttendanceRequest {
  status?: 'present' | 'absent' | 'late' | 'excused';
  modificationReason?: string;
}

export interface IAttendanceResponse {
  id: string;
  schoolId: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  date: Date;
  period: number;
  status: string;
  markedAt: Date;
  modifiedAt?: Date;
  modifiedBy?: string;
  modificationReason?: string;
  isLocked: boolean;
  canModify: boolean;
  timeSinceMarked: number;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: string;
    userId: string;
    studentId: string;
    fullName: string;
    rollNumber: number;
  };
  teacher?: {
    id: string;
    userId: string;
    teacherId: string;
    fullName: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  class?: {
    id: string;
    grade: number;
    section: string;
    name: string;
  };
}

export interface IAttendanceStats {
  totalClasses: number;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
  byStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  byGrade: Array<{
    grade: number;
    totalStudents: number;
    presentCount: number;
    attendancePercentage: number;
  }>;
  dailyTrend: Array<{
    date: Date;
    totalClasses: number;
    attendancePercentage: number;
  }>;
}

export interface IStudentAttendanceReport {
  studentId: string;
  studentName: string;
  rollNumber: number;
  grade: number;
  section: string;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  lateClasses: number;
  excusedClasses: number;
  attendancePercentage: number;
  subjectWiseAttendance: Array<{
    subjectId: string;
    subjectName: string;
    totalClasses: number;
    presentClasses: number;
    attendancePercentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    year: number;
    totalClasses: number;
    presentClasses: number;
    attendancePercentage: number;
  }>;
}

export interface IClassAttendanceRequest {
  schoolId: string;
  grade: number;
  section: string;
  date: string;
  period?: number;
}

export interface IAttendanceFilters {
  schoolId?: string;
  studentId?: string;
  teacherId?: string;
  classId?: string;
  subjectId?: string;
  date?: Date;
  period?: number;
  status?: 'present' | 'absent' | 'late' | 'excused';
  startDate?: Date;
  endDate?: Date;
}