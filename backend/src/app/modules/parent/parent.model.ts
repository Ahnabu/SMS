import { Schema, model } from 'mongoose';
import {
  IParent,
  IParentDocument,
  IParentMethods,
  IParentModel,
} from './parent.interface';

// Parent schema definition
const parentSchema = new Schema<IParentDocument, IParentModel, IParentMethods>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    parentId: {
      type: String,
      required: [true, 'Parent ID is required'],
      unique: true,
      trim: true,
      match: [/^PAR-\d{4}-\d{3}$/, 'Parent ID must follow format PAR-YYYY-XXX'],
      index: true,
    },
    children: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Student',
        }
      ],
      required: [true, 'At least one child is required'],
      validate: {
        validator: function (children: any[]) {
          return children.length > 0;
        },
        message: 'At least one child must be associated',
      },
      index: true,
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      enum: {
        values: ['Father', 'Mother', 'Guardian', 'Step Parent', 'Foster Parent', 'Grandparent', 'Other'],
        message: 'Invalid relationship type',
      },
      index: true,
    },
    occupation: {
      type: String,
      trim: true,
      maxlength: [100, 'Occupation cannot exceed 100 characters'],
    },
    qualification: {
      type: String,
      trim: true,
      maxlength: [100, 'Qualification cannot exceed 100 characters'],
    },
    monthlyIncome: {
      amount: {
        type: Number,
        min: [0, 'Income amount cannot be negative'],
      },
      currency: {
        type: String,
        default: 'INR',
        trim: true,
        uppercase: true,
        maxlength: [3, 'Currency code cannot exceed 3 characters'],
      },
    },
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: [200, 'Street address cannot exceed 200 characters'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxlength: [100, 'City cannot exceed 100 characters'],
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        maxlength: [100, 'State cannot exceed 100 characters'],
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
        trim: true,
        match: [/^\d{5,6}$/, 'Invalid zip code format'],
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        maxlength: [100, 'Country cannot exceed 100 characters'],
      },
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Emergency contact name cannot exceed 100 characters'],
      },
      relationship: {
        type: String,
        trim: true,
        maxlength: [50, 'Emergency contact relationship cannot exceed 50 characters'],
      },
      phone: {
        type: String,
        match: [/^\+?[\d\s\-\(\)]+$/, 'Invalid emergency contact phone format'],
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid emergency contact email format'],
      },
    },
    preferences: {
      communicationMethod: {
        type: String,
        enum: {
          values: ['Email', 'SMS', 'Phone Call', 'All'],
          message: 'Invalid communication method',
        },
        default: 'All',
      },
      receiveNewsletters: {
        type: Boolean,
        default: true,
      },
      receiveAttendanceAlerts: {
        type: Boolean,
        default: true,
      },
      receiveExamResults: {
        type: Boolean,
        default: true,
      },
      receiveEventNotifications: {
        type: Boolean,
        default: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Instance methods
parentSchema.methods.generateParentId = function (): string {
  const year = new Date().getFullYear();
  const sequence = Math.floor(Math.random() * 900) + 100; // 3-digit random number
  return `PAR-${year}-${sequence}`;
};

parentSchema.methods.getFullName = function (): string {
  // Type assertion to handle both ObjectId and populated User
  const userId = this.userId as any;
  return `${userId?.firstName || ''} ${userId?.lastName || ''}`.trim();
};

parentSchema.methods.getChildrenCount = async function (): Promise<number> {
  return this.children.length;
};

parentSchema.methods.canReceiveNotifications = function (): boolean {
  return this.isActive && (
    this.preferences.receiveNewsletters ||
    this.preferences.receiveAttendanceAlerts ||
    this.preferences.receiveExamResults ||
    this.preferences.receiveEventNotifications
  );
};

parentSchema.methods.isGuardianOf = function (studentId: string): boolean {
  return this.children.some(childId => childId.toString() === studentId);
};

// Static methods
parentSchema.statics.findBySchool = function (schoolId: string): Promise<IParentDocument[]> {
  return this.find({ schoolId, isActive: true })
    .populate('userId', 'firstName lastName username email phone')
    .populate('schoolId', 'name')
    .populate('children', 'studentId grade section rollNumber userId')
    .sort({ createdAt: -1 });
};

parentSchema.statics.findByStudent = function (studentId: string): Promise<IParentDocument[]> {
  return this.find({ children: studentId, isActive: true })
    .populate('userId', 'firstName lastName username email phone')
    .populate('children', 'studentId grade section rollNumber userId');
};

parentSchema.statics.findByParentId = function (parentId: string): Promise<IParentDocument | null> {
  return this.findOne({ parentId })
    .populate('userId', 'firstName lastName username email phone')
    .populate('schoolId', 'name')
    .populate('children', 'studentId grade section rollNumber userId');
};

parentSchema.statics.generateNextParentId = async function (
  schoolId: string,
  year: number = new Date().getFullYear()
): Promise<string> {
  const prefix = `PAR-${year}-`;

  // Find the highest sequence number for this school and year
  const lastParent = await this.findOne({
    schoolId,
    parentId: { $regex: `^${prefix}` }
  }).sort({ parentId: -1 });

  let nextSequence = 1;
  if (lastParent) {
    const lastSequence = parseInt(lastParent.parentId.split('-')[2]);
    nextSequence = lastSequence + 1;
  }

  const sequenceStr = nextSequence.toString().padStart(3, '0');
  return `${prefix}${sequenceStr}`;
};

// Indexes for performance
parentSchema.index({ schoolId: 1, isActive: 1 });
parentSchema.index({ schoolId: 1, relationship: 1 });
parentSchema.index({ children: 1 });
parentSchema.index({ createdAt: -1 });

// Pre-save middleware
parentSchema.pre('save', async function (next) {
  // Generate parent ID if not provided
  if (this.isNew && !this.parentId) {
    this.parentId = await (this.constructor as IParentModel).generateNextParentId(
      this.schoolId.toString()
    );
  }

  next();
});

// Virtual for children count
parentSchema.virtual('childrenCount').get(function () {
  return this.children.length;
});

// Ensure virtual fields are serialized
parentSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});

parentSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});

// Export the model
export const Parent = model<IParentDocument, IParentModel>('Parent', parentSchema);