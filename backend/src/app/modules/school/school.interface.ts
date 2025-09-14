import { Document, Types } from 'mongoose';

export interface ISchool {
  orgId: Types.ObjectId;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  adminUsername: string;
  adminPasswordHash: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: {
    maxStudentsPerSection: number;
    grades: number[];
    sections: string[];
    academicYearStart: number; // Month (1-12)
    academicYearEnd: number; // Month (1-12)
    attendanceGracePeriod: number; // Minutes
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISchoolDocument extends ISchool, Document {
  _id: Types.ObjectId;
}

export interface ISchoolMethods {
  isActive(): boolean;
  generateCredentials(): { username: string; password: string };
  validateCredentials(password: string): Promise<boolean>;
  updateAdminPassword(newPassword: string): Promise<ISchoolDocument>;
}

export interface ISchoolModel extends Document {
  findByOrganization(orgId: string): Promise<ISchoolDocument[]>;
  findActiveSchools(): Promise<ISchoolDocument[]>;
  findByAdminUsername(username: string): Promise<ISchoolDocument | null>;
}

// Request/Response interfaces
export interface ICreateSchoolRequest {
  orgId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  settings?: {
    maxStudentsPerSection?: number;
    grades?: number[];
    sections?: string[];
    academicYearStart?: number;
    academicYearEnd?: number;
    attendanceGracePeriod?: number;
  };
}

export interface IUpdateSchoolRequest {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'suspended';
  settings?: {
    maxStudentsPerSection?: number;
    grades?: number[];
    sections?: string[];
    academicYearStart?: number;
    academicYearEnd?: number;
    attendanceGracePeriod?: number;
  };
}

export interface ISchoolResponse {
  id: string;
  orgId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  adminUsername: string;
  status: string;
  settings: {
    maxStudentsPerSection: number;
    grades: number[];
    sections: string[];
    academicYearStart: number;
    academicYearEnd: number;
    attendanceGracePeriod: number;
  };
  createdAt: Date;
  updatedAt: Date;
  studentsCount?: number;
  teachersCount?: number;
  organization?: {
    id: string;
    name: string;
  };
}

export interface ISchoolCredentials {
  username: string;
  password: string;
  tempPassword: string;
}