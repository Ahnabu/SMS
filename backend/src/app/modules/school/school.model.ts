import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import config from '../../config';
import {
  ISchool,
  ISchoolDocument,
  ISchoolMethods,
  ISchoolModel,
  SchoolStatus,
  ISchoolAddress,
  ISchoolContact,
  ISchoolSettings,
  IAcademicSession
} from './school.interface';

// Address sub-schema
const addressSchema = new Schema<ISchoolAddress>({
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true,
    maxlength: [200, 'Street address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [100, 'State name cannot exceed 100 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [100, 'Country name cannot exceed 100 characters']
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
    maxlength: [20, 'Postal code cannot exceed 20 characters']
  },
  coordinates: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  }
}, { _id: false });

// Contact sub-schema
const contactSchema = new Schema<ISchoolContact>({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function (phone: string) {
        return /^\+?[\d\s\-\(\)]+$/.test(phone);
      },
      message: 'Invalid phone number format'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function (email: string) {
        return /^\S+@\S+\.\S+$/.test(email);
      },
      message: 'Invalid email format'
    }
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function (url: string) {
        return !url || /^https?:\/\/.+\..+/.test(url);
      },
      message: 'Invalid website URL'
    }
  },
  fax: {
    type: String,
    trim: true
  }
}, { _id: false });

// Settings schema for school configuration
const settingsSchema = new Schema<ISchoolSettings>({
  maxStudentsPerSection: {
    type: Number,
    default: config.max_students_per_section,
    min: [10, 'Maximum students per section must be at least 10'],
    max: [60, 'Maximum students per section cannot exceed 60']
  },
  grades: {
    type: [Number],
    default: config.default_grades,
    validate: {
      validator: function (grades: number[]) {
        return grades.every(grade => grade >= 1 && grade <= 12);
      },
      message: 'Grades must be between 1 and 12'
    }
  },
  sections: {
    type: [String],
    default: config.default_sections,
    validate: {
      validator: function (sections: string[]) {
        return sections.length > 0 && sections.every(section => /^[A-Z]$/.test(section));
      },
      message: 'Sections must be uppercase letters (A-Z)'
    }
  },
  academicYearStart: {
    type: Number,
    default: config.academic_year_start_month,
    min: [1, 'Academic year start month must be between 1 and 12'],
    max: [12, 'Academic year start month must be between 1 and 12']
  },
  academicYearEnd: {
    type: Number,
    default: config.academic_year_end_month,
    min: [1, 'Academic year end month must be between 1 and 12'],
    max: [12, 'Academic year end month must be between 1 and 12']
  },
  attendanceGracePeriod: {
    type: Number,
    default: config.attendance_grace_period_minutes,
    min: [0, 'Attendance grace period cannot be negative'],
    max: [60, 'Attendance grace period cannot exceed 60 minutes']
  },
  maxPeriodsPerDay: {
    type: Number,
    default: config.max_periods_per_day,
    min: [1, 'Must have at least 1 period per day'],
    max: [12, 'Cannot exceed 12 periods per day']
  },
  timezone: {
    type: String,
    default: config.default_timezone
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'or', 'pa']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  attendanceLockAfterDays: {
    type: Number,
    default: config.attendance_lock_after_days,
    min: [1, 'Attendance lock must be at least 1 day'],
    max: [30, 'Attendance lock cannot exceed 30 days']
  },
  maxAttendanceEditHours: {
    type: Number,
    default: config.max_attendance_edit_hours,
    min: [1, 'Attendance edit window must be at least 1 hour'],
    max: [72, 'Attendance edit window cannot exceed 72 hours']
  }
}, { _id: false });

// Academic session sub-schema
const academicSessionSchema = new Schema<IAcademicSession>({
  name: {
    type: String,
    required: [true, 'Session name is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Session start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'Session end date is required']
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Stats sub-schema
const statsSchema = new Schema({
  totalStudents: { type: Number, default: 0 },
  totalTeachers: { type: Number, default: 0 },
  totalParents: { type: Number, default: 0 },
  totalClasses: { type: Number, default: 0 },
  totalSubjects: { type: Number, default: 0 },
  attendanceRate: { type: Number, default: 0, min: 0, max: 100 },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

// School schema definition
const schoolSchema = new Schema<ISchoolDocument, ISchoolModel, ISchoolMethods>(
  {
    // Legacy field - keeping for backward compatibility
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true
    },
    
    // Basic Information
    name: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
      maxlength: [100, 'School name cannot exceed 100 characters'],
      index: true
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    schoolId: {
      type: String,
      unique: true,
      trim: true,
      index: true
    },
    establishedYear: {
      type: Number,
      min: [1800, 'Established year cannot be before 1800'],
      max: [new Date().getFullYear(), 'Established year cannot be in the future']
    },
    
    // Contact Information
    address: {
      type: addressSchema,
      required: [true, 'Address is required']
    },
    contact: {
      type: contactSchema,
      required: [true, 'Contact information is required']
    },
    
    // Administrative
    status: {
      type: String,
      enum: {
        values: Object.values(SchoolStatus),
        message: 'Invalid school status'
      },
      default: SchoolStatus.PENDING_APPROVAL,
      index: true
    },
    adminUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin user ID is required'],
      index: true
    },
    
    // Legacy admin fields - keeping for backward compatibility
    adminUsername: {
      type: String,
      trim: true,
      lowercase: true,
      index: { sparse: true }
    },
    adminPasswordHash: {
      type: String,
      select: false
    },
    
    // Educational Details
    affiliation: {
      type: String,
      trim: true,
      maxlength: [100, 'Affiliation cannot exceed 100 characters']
    },
    recognition: {
      type: String,
      trim: true,
      maxlength: [200, 'Recognition details cannot exceed 200 characters']
    },
    
    // Settings
    settings: {
      type: settingsSchema,
      default: () => ({})
    },
    
    // Academic Sessions
    currentSession: {
      type: academicSessionSchema,
      required: [true, 'Current academic session is required']
    },
    academicSessions: {
      type: [academicSessionSchema],
      default: []
    },
    
    // API Configuration
    apiEndpoint: {
      type: String,
      unique: true,
      index: true
    },
    apiKey: {
      type: String,
      unique: true,
      index: true
    },
    
    // Media
    logo: {
      type: String,
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    
    // Metadata
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by field is required'],
      index: true
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    
    // Statistics
    stats: {
      type: statsSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Instance methods

// Legacy methods - keeping for backward compatibility
schoolSchema.methods.checkIsActive = function (this: ISchoolDocument): boolean {
  return this.status === SchoolStatus.ACTIVE;
};

schoolSchema.methods.generateCredentials = function (this: ISchoolDocument): { username: string; password: string } {
  const schoolPrefix = this.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toLowerCase();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const username = `${schoolPrefix}admin${randomNum}`;
  const password = Math.random().toString(36).slice(-8);
  return { username, password };
};

schoolSchema.methods.validateCredentials = async function (this: ISchoolDocument, password: string): Promise<boolean> {
  if (!this.adminPasswordHash) return false;
  return await bcrypt.compare(password, this.adminPasswordHash);
};

schoolSchema.methods.updateAdminPassword = async function (this: ISchoolDocument, newPassword: string): Promise<ISchoolDocument> {
  this.adminPasswordHash = await bcrypt.hash(newPassword, 12);
  return await this.save();
};

// New enhanced methods
schoolSchema.methods.generateApiEndpoint = function (this: ISchoolDocument): string {
  return `/api/attendance/${this.slug || this.schoolId}`;
};

schoolSchema.methods.generateApiKey = function (this: ISchoolDocument): string {
  return crypto.randomBytes(32).toString('hex');
};

schoolSchema.methods.regenerateApiKey = async function (this: ISchoolDocument): Promise<string> {
  this.apiKey = this.generateApiKey();
  await this.save();
  return this.apiKey;
};

schoolSchema.methods.updateStats = async function (this: ISchoolDocument): Promise<ISchoolDocument> {
  // This will be implemented when other models are created
  // For now, just update the timestamp
  if (!this.stats) {
    this.stats = {
      totalStudents: 0,
      totalTeachers: 0,
      totalParents: 0,
      totalClasses: 0,
      totalSubjects: 0,
      attendanceRate: 0,
      lastUpdated: new Date()
    };
  } else {
    this.stats.lastUpdated = new Date();
  }
  return await this.save();
};

schoolSchema.methods.isCurrentlyActive = function (this: ISchoolDocument): boolean {
  return this.status === SchoolStatus.ACTIVE && this.isActive;
};

schoolSchema.methods.getCurrentAcademicSession = function (this: ISchoolDocument): IAcademicSession | null {
  return this.currentSession || null;
};

schoolSchema.methods.createNewAcademicSession = async function (
  this: ISchoolDocument,
  session: Omit<IAcademicSession, 'isActive'>
): Promise<ISchoolDocument> {
  const newSession = { ...session, isActive: false };
  this.academicSessions.push(newSession);
  return await this.save();
};

schoolSchema.methods.setActiveAcademicSession = async function (this: ISchoolDocument, sessionName: string): Promise<ISchoolDocument> {
  const session = this.academicSessions.find(s => s.name === sessionName);
  if (!session) {
    throw new Error('Academic session not found');
  }
  
  // Deactivate current session
  this.currentSession.isActive = false;
  
  // Set new active session
  session.isActive = true;
  this.currentSession = { ...session };
  
  return await this.save();
};

schoolSchema.methods.getGradesOffered = function (this: ISchoolDocument): number[] {
  return this.settings?.grades || [];
};

schoolSchema.methods.getSectionsForGrade = function (this: ISchoolDocument, grade: number): string[] {
  if (!this.getGradesOffered().includes(grade)) {
    return [];
  }
  return this.settings?.sections || [];
};

schoolSchema.methods.canEnrollStudents = function (this: ISchoolDocument): boolean {
  return this.isCurrentlyActive();
};

schoolSchema.methods.getMaxStudentsForGrade = function (this: ISchoolDocument, grade: number): number {
  const sections = this.getSectionsForGrade(grade);
  return sections.length * (this.settings?.maxStudentsPerSection || 40);
};

schoolSchema.methods.createGoogleDriveFolder = async function (this: ISchoolDocument): Promise<string> {
  // This will be implemented when Google Drive integration is added
  return `folder_id_${this.schoolId}`;
};

// Static methods

// Legacy methods - keeping for backward compatibility
schoolSchema.statics.findByOrganization = function (orgId: string): Promise<ISchoolDocument[]> {
  return this.find({ orgId }).populate('orgId', 'name status').sort({ name: 1 });
};

schoolSchema.statics.findActiveSchools = function (): Promise<ISchoolDocument[]> {
  return this.find({ status: SchoolStatus.ACTIVE, isActive: true })
    .populate('adminUserId', 'username firstName lastName email phone')
    .sort({ name: 1 });
};

schoolSchema.statics.findByAdminUsername = function (username: string): Promise<ISchoolDocument | null> {
  return this.findOne({ adminUsername: username.toLowerCase() }).select('+adminPasswordHash');
};

// New enhanced methods
schoolSchema.statics.findBySlug = function (slug: string): Promise<ISchoolDocument | null> {
  return this.findOne({ slug: slug.toLowerCase() })
    .populate('adminUserId', 'username firstName lastName email phone')
    .populate('createdBy', 'username firstName lastName');
};

schoolSchema.statics.findBySchoolId = function (schoolId: string): Promise<ISchoolDocument | null> {
  return this.findOne({ schoolId })
    .populate('adminUserId', 'username firstName lastName email phone')
    .populate('createdBy', 'username firstName lastName');
};

schoolSchema.statics.findByAdmin = function (adminId: string): Promise<ISchoolDocument | null> {
  return this.findOne({ adminUserId: adminId });
};

schoolSchema.statics.findByStatus = function (status: SchoolStatus): Promise<ISchoolDocument[]> {
  return this.find({ status })
    .populate('adminUserId', 'username firstName lastName email phone')
    .sort({ name: 1 });
};

schoolSchema.statics.findByApiKey = function (apiKey: string): Promise<ISchoolDocument | null> {
  return this.findOne({ apiKey, isActive: true });
};

schoolSchema.statics.generateUniqueSchoolId = async function (): Promise<string> {
  let schoolId: string;
  let isUnique = false;
  let counter = 1;
  
  while (!isUnique) {
    schoolId = `SCH${counter.toString().padStart(4, '0')}`;
    const existing = await this.findOne({ schoolId });
    if (!existing) {
      isUnique = true;
    } else {
      counter++;
    }
  }
  
  return schoolId!;
};

schoolSchema.statics.generateUniqueSlug = async function (name: string): Promise<string> {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  
  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;
  
  while (!isUnique) {
    const existing = await this.findOne({ slug });
    if (!existing) {
      isUnique = true;
    } else {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }
  
  return slug;
};

schoolSchema.statics.search = function (query: string): Promise<ISchoolDocument[]> {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { schoolId: { $regex: query, $options: 'i' } },
      { 'address.city': { $regex: query, $options: 'i' } },
      { affiliation: { $regex: query, $options: 'i' } }
    ],
    isActive: true
  }).populate('adminUserId', 'username firstName lastName email phone')
    .sort({ name: 1 })
    .limit(50);
};

// Indexes for performance
schoolSchema.index({ name: 1, isActive: 1 });
schoolSchema.index({ status: 1, isActive: 1 });
schoolSchema.index({ createdBy: 1 });
schoolSchema.index({ 'address.city': 1, 'address.state': 1 });
schoolSchema.index({ affiliation: 1 });
schoolSchema.index({ 'currentSession.isActive': 1 });
schoolSchema.index({ createdAt: -1 });

// Legacy indexes - keeping for backward compatibility
schoolSchema.index({ orgId: 1, status: 1 });

// Pre-save middleware
schoolSchema.pre('save', async function (next) {
  // Generate unique identifiers if not provided
  if (this.isNew) {
    if (!this.schoolId) {
      this.schoolId = await (this.constructor as ISchoolModel).generateUniqueSchoolId();
    }
    
    if (!this.slug) {
      this.slug = await (this.constructor as ISchoolModel).generateUniqueSlug(this.name);
    }
    
    if (!this.apiEndpoint) {
      this.apiEndpoint = this.generateApiEndpoint();
    }
    
    if (!this.apiKey) {
      this.apiKey = this.generateApiKey();
    }
    
    // Set current session as active
    if (this.currentSession) {
      this.currentSession.isActive = true;
      this.academicSessions = [this.currentSession];
    }
  }

  // Hash password if it's being modified and not already hashed (legacy support)
  if (this.isModified('adminPasswordHash') && this.adminPasswordHash && !this.adminPasswordHash.startsWith('$2a$')) {
    this.adminPasswordHash = await bcrypt.hash(this.adminPasswordHash, 12);
  }

  // Normalize school name (title case)
  if (this.isModified('name')) {
    this.name = this.name.trim().replace(/\w\S*/g, (txt: string) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  // Update slug if name changed
  if (this.isModified('name') && !this.isNew) {
    this.slug = await (this.constructor as ISchoolModel).generateUniqueSlug(this.name);
  }

  // Ensure admin username is lowercase (legacy support)
  if (this.isModified('adminUsername') && this.adminUsername) {
    this.adminUsername = this.adminUsername.toLowerCase();
  }

  // Update API endpoint if slug changed
  if (this.isModified('slug')) {
    this.apiEndpoint = this.generateApiEndpoint();
  }

  // Validate academic session dates
  if (this.currentSession) {
    if (this.currentSession.endDate <= this.currentSession.startDate) {
      return next(new Error('Academic session end date must be after start date'));
    }
  }

  next();
});

// Pre-delete middleware to check for dependent data
schoolSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  // Check for students, teachers, etc. (will be implemented when those models are created)
  // For now, just proceed
  next();
});

// Virtual for students count
schoolSchema.virtual('studentsCount', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'schoolId',
  count: true
});

// Virtual for teachers count
schoolSchema.virtual('teachersCount', {
  ref: 'Teacher',
  localField: '_id',
  foreignField: 'schoolId',
  count: true
});

// Ensure virtual fields are serialized
schoolSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete (ret as any)._id;
    delete (ret as any).__v;
    delete (ret as any).adminPasswordHash; // Never expose password hash
    return ret;
  }
});

schoolSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete (ret as any)._id;
    delete (ret as any).__v;
    delete (ret as any).adminPasswordHash; // Never expose password hash
    return ret;
  }
});

// Export the model
export const School = model<ISchoolDocument, ISchoolModel>('School', schoolSchema);