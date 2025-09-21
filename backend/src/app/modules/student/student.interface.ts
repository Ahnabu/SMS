import { Document, Types, Model } from 'mongoose';

export interface IStudent {
  userId: Types.ObjectId;
  schoolId: Types.ObjectId;
  studentId: string; // Auto-generated unique ID (e.g., 2025-07-001)
  grade: number;
  section: string;
  bloodGroup: string;
  dob: Date;
  admissionDate: Date;
  admissionYear: number; // Extracted from admission date for easier querying
  parentId?: Types.ObjectId;
  rollNumber?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudentDocument extends IStudent, Document {
  _id: Types.ObjectId;
}

export interface IStudentPhoto {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  photoPath: string;
  photoNumber: number; // 1-20
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  createdAt?: Date;
}

export interface IStudentPhotoDocument extends IStudentPhoto, Document {
  _id: Types.ObjectId;
}

export interface IStudentMethods {
  generateStudentId(): string;
  getAgeInYears(): number;
  getFullName(): string;
  getFolderPath(): string; // For face recognition folder structure
  canUploadMorePhotos(): Promise<boolean>;
}

export interface IStudentModel extends Model<IStudentDocument> {
  findBySchool(schoolId: string): Promise<IStudentDocument[]>;
  findByGradeAndSection(schoolId: string, grade: number, section: string): Promise<IStudentDocument[]>;
  findByStudentId(studentId: string): Promise<IStudentDocument | null>;
  generateNextStudentId(schoolId: string, grade: number, year?: number): Promise<string>;
}

// Request/Response interfaces
export interface ICreateStudentRequest {
  schoolId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  grade: number;
  section: string;
  bloodGroup: string;
  dob: string; // ISO date string
  admissionDate?: string; // ISO date string, defaults to today
  rollNumber?: number;
  parentInfo?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    occupation?: string;
  };
}

export interface IUpdateStudentRequest {
  grade?: number;
  section?: string;
  bloodGroup?: string;
  rollNumber?: number;
  isActive?: boolean;
}

export interface IStudentResponse {
  id: string;
  userId: string;
  schoolId: string;
  studentId: string;
  grade: number;
  section: string;
  bloodGroup: string;
  dob: Date;
  admissionDate: Date;
  admissionYear: number;
  parentId?: string;
  rollNumber?: number;
  isActive: boolean;
  age: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email?: string;
    phone?: string;
  };
  school?: {
    id: string;
    name: string;
  };
  parent?: {
    id: string;
    userId: string;
    fullName: string;
  };
  photos?: IStudentPhotoResponse[];
  photoCount: number;
}

export interface IStudentPhotoResponse {
  id: string;
  photoPath: string;
  photoNumber: number;
  filename: string;
  size: number;
  createdAt: Date;
}

export interface IStudentStats {
  totalStudents: number;
  activeStudents: number;
  byGrade: Array<{
    grade: number;
    count: number;
  }>;
  bySection: Array<{
    section: string;
    count: number;
  }>;
  recentAdmissions: number; // Last 30 days
}

export interface IPhotoUploadRequest {
  studentId: string;
  photos: Express.Multer.File[];
}