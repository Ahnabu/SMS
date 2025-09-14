import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../../config';
import {
  ISchool,
  ISchoolDocument,
  ISchoolMethods,
  ISchoolModel,
} from './school.interface';

// Settings schema for school configuration
const settingsSchema = new Schema({
  maxStudentsPerSection: {
    type: Number,
    default: config.max_students_per_section,
    min: [10, 'Maximum students per section must be at least 10'],
    max: [60, 'Maximum students per section cannot exceed 60'],
  },
  grades: {
    type: [Number],
    default: config.default_grades,
    validate: {
      validator: function (grades: number[]) {
        return grades.every(grade => grade >= 1 && grade <= 12);
      },
      message: 'Grades must be between 1 and 12',
    },
  },
  sections: {
    type: [String],
    default: config.default_sections,
    validate: {
      validator: function (sections: string[]) {
        return sections.length > 0 && sections.every(section => /^[A-Z]$/.test(section));
      },
      message: 'Sections must be uppercase letters (A-Z)',
    },
  },
  academicYearStart: {
    type: Number,
    default: config.academic_year_start_month,
    min: [1, 'Academic year start month must be between 1 and 12'],
    max: [12, 'Academic year start month must be between 1 and 12'],
  },
  academicYearEnd: {
    type: Number,
    default: config.academic_year_end_month,
    min: [1, 'Academic year end month must be between 1 and 12'],
    max: [12, 'Academic year end month must be between 1 and 12'],
  },
  attendanceGracePeriod: {
    type: Number,
    default: config.attendance_grace_period_minutes,
    min: [0, 'Attendance grace period cannot be negative'],
    max: [60, 'Attendance grace period cannot exceed 60 minutes'],
  },
}, { _id: false });

// School schema definition
const schoolSchema = new Schema<ISchoolDocument, ISchoolModel, ISchoolMethods>(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
      maxlength: [100, 'School name cannot exceed 100 characters'],
      index: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (phone: string) {
          return !phone || /^\+?[\d\s\-\(\)]+$/.test(phone);
        },
        message: 'Invalid phone number format',
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          return !email || /^\S+@\S+\.\S+$/.test(email);
        },
        message: 'Invalid email format',
      },
    },
    adminUsername: {
      type: String,
      required: [true, 'Admin username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Admin username must be at least 3 characters'],
      maxlength: [20, 'Admin username cannot exceed 20 characters'],
      match: [/^[a-z0-9_]+$/, 'Admin username can only contain lowercase letters, numbers, and underscores'],
      index: true,
    },
    adminPasswordHash: {
      type: String,
      required: [true, 'Admin password is required'],
      select: false, // Don't include in queries by default
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'suspended'],
        message: 'Status must be active, inactive, or suspended',
      },
      default: 'active',
      index: true,
    },
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Instance methods
schoolSchema.methods.isActive = function (): boolean {
  return this.status === 'active';
};

schoolSchema.methods.generateCredentials = function (): { username: string; password: string } {
  // Generate username from school name (first 3 chars + random number)
  const schoolPrefix = this.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toLowerCase();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const username = `${schoolPrefix}admin${randomNum}`;

  // Generate random password
  const password = Math.random().toString(36).slice(-8);

  return { username, password };
};

schoolSchema.methods.validateCredentials = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.adminPasswordHash);
};

schoolSchema.methods.updateAdminPassword = async function (newPassword: string): Promise<ISchoolDocument> {
  this.adminPasswordHash = await bcrypt.hash(newPassword, 12);
  return await this.save();
};

// Static methods
schoolSchema.statics.findByOrganization = function (orgId: string): Promise<ISchoolDocument[]> {
  return this.find({ orgId }).populate('orgId', 'name status').sort({ name: 1 });
};

schoolSchema.statics.findActiveSchools = function (): Promise<ISchoolDocument[]> {
  return this.find({ status: 'active' }).populate('orgId', 'name status').sort({ name: 1 });
};

schoolSchema.statics.findByAdminUsername = function (username: string): Promise<ISchoolDocument | null> {
  return this.findOne({ adminUsername: username.toLowerCase() }).select('+adminPasswordHash');
};

// Indexes for performance
schoolSchema.index({ orgId: 1, status: 1 });
schoolSchema.index({ name: 1, orgId: 1 }, { unique: true });
schoolSchema.index({ createdAt: -1 });

// Pre-save middleware
schoolSchema.pre('save', async function (next) {
  // Hash password if it's being modified and not already hashed
  if (this.isModified('adminPasswordHash') && !this.adminPasswordHash.startsWith('$2a$')) {
    this.adminPasswordHash = await bcrypt.hash(this.adminPasswordHash, 12);
  }

  // Normalize school name (title case)
  if (this.isModified('name')) {
    this.name = this.name.trim().replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  // Ensure admin username is lowercase
  if (this.isModified('adminUsername')) {
    this.adminUsername = this.adminUsername.toLowerCase();
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
  count: true,
});

// Virtual for teachers count
schoolSchema.virtual('teachersCount', {
  ref: 'Teacher',
  localField: '_id',
  foreignField: 'schoolId',
  count: true,
});

// Ensure virtual fields are serialized
schoolSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.adminPasswordHash; // Never expose password hash
    return ret;
  },
});

schoolSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.adminPasswordHash; // Never expose password hash
    return ret;
  },
});

// Export the model
export const School = model<ISchoolDocument, ISchoolModel>('School', schoolSchema);