import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { AppError } from '../../errors/AppError';
import { School } from '../school/school.model';
import { Student } from '../student/student.model';
import { User } from '../user/user.model';
import { Parent } from './parent.model';
import {
  ICreateParentRequest,
  IUpdateParentRequest,
  IParentResponse,
  IParentStats,
} from './parent.interface';

class ParentService {
  async createParent(parentData: ICreateParentRequest): Promise<IParentResponse> {
    try {
      // Verify school exists and is active
      const school = await School.findById(parentData.schoolId);
      if (!school) {
        throw new AppError(httpStatus.NOT_FOUND, 'School not found');
      }

      // Verify children exist and belong to the same school
      const children = await Student.find({
        _id: { $in: parentData.children },
        schoolId: parentData.schoolId,
      });

      if (children.length !== parentData.children.length) {
        throw new AppError(httpStatus.BAD_REQUEST, 'One or more students not found in the specified school');
      }

      // Generate parent ID
      const parentId = await Parent.generateNextParentId(parentData.schoolId);
      
      // Generate username from parent ID
      const username = parentId.replace(/-/g, '').toLowerCase();

      // Create user account for parent
      const newUser = await User.create({
        schoolId: parentData.schoolId,
        role: 'parent',
        username,
        passwordHash: parentId, // Temporary password, same as parent ID
        firstName: parentData.firstName,
        lastName: parentData.lastName,
        email: parentData.email,
        phone: parentData.phone,
      });

      // Create parent record
      const newParent = await Parent.create({
        userId: newUser._id,
        schoolId: parentData.schoolId,
        parentId,
        children: parentData.children,
        relationship: parentData.relationship,
        occupation: parentData.occupation,
        qualification: parentData.qualification,
        monthlyIncome: parentData.monthlyIncome ? {
          ...parentData.monthlyIncome,
          currency: parentData.monthlyIncome.currency || 'INR',
        } : undefined,
        address: {
          ...parentData.address,
          country: parentData.address.country 
        },
        emergencyContact: parentData.emergencyContact,
        preferences: {
          communicationMethod: parentData.preferences?.communicationMethod || 'All',
          receiveNewsletters: parentData.preferences?.receiveNewsletters ?? true,
          receiveAttendanceAlerts: parentData.preferences?.receiveAttendanceAlerts ?? true,
          receiveExamResults: parentData.preferences?.receiveExamResults ?? true,
          receiveEventNotifications: parentData.preferences?.receiveEventNotifications ?? true,
        },
      });

      // Update students with parent reference
      await Student.updateMany(
        { _id: { $in: parentData.children } },
        { parentId: newParent._id }
      );

      // Populate and return
      await newParent.populate([
        { path: 'userId', select: 'firstName lastName username email phone' },
        { path: 'schoolId', select: 'name' },
        { path: 'children', select: 'studentId grade section rollNumber', populate: { path: 'userId', select: 'firstName lastName' } },
      ]);

      return this.formatParentResponse(newParent);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to create parent: ${(error as Error).message}`
      );
    }
  }

  async getParents(queryParams: {
    page: number;
    limit: number;
    schoolId?: string;
    relationship?: string;
    isActive?: string;
    search?: string;
    sortBy: string;
    sortOrder: string;
  }): Promise<{
    parents: IParentResponse[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    try {
      const { page, limit, schoolId, relationship, isActive, search, sortBy, sortOrder } = queryParams;
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {};

      if (schoolId) {
        query.schoolId = schoolId;
      }

      if (relationship) {
        query.relationship = relationship;
      }

      if (isActive && isActive !== 'all') {
        query.isActive = isActive === 'true';
      }

      // Build search query for user fields
      let userQuery: any = {};
      if (search) {
        userQuery.$or = [
          { firstName: { $regex: new RegExp(search, 'i') } },
          { lastName: { $regex: new RegExp(search, 'i') } },
          { username: { $regex: new RegExp(search, 'i') } },
        ];
      }

      // If we have user search criteria, find matching users first
      let userIds: Types.ObjectId[] = [];
      if (Object.keys(userQuery).length > 0) {
        const matchingUsers = await User.find(userQuery).select('_id');
        userIds = matchingUsers.map(user => user._id);
        query.userId = { $in: userIds };
      }

      // Handle parent ID search separately
      if (search && !userQuery.$or) {
        query.$or = [
          { parentId: { $regex: new RegExp(search, 'i') } },
        ];
      }

      // Build sort
      const sort: any = {};
      if (sortBy === 'firstName' || sortBy === 'lastName') {
        sort.relationship = 1;
        sort.createdAt = -1;
      } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      // Execute queries
      const [parents, totalCount] = await Promise.all([
        Parent.find(query)
          .populate('userId', 'firstName lastName username email phone')
          .populate('schoolId', 'name')
          .populate('children', 'studentId grade section rollNumber userId')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Parent.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        parents: parents.map(parent => this.formatParentResponse(parent)),
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch parents: ${(error as Error).message}`
      );
    }
  }

  async getParentById(id: string): Promise<IParentResponse> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid parent ID format');
      }

      const parent = await Parent.findById(id)
        .populate('userId', 'firstName lastName username email phone')
        .populate('schoolId', 'name')
        .populate('children', 'studentId grade section rollNumber userId')
        .lean();

      if (!parent) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parent not found');
      }

      return this.formatParentResponse(parent);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch parent: ${(error as Error).message}`
      );
    }
  }

  async updateParent(id: string, updateData: IUpdateParentRequest): Promise<IParentResponse> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid parent ID format');
      }

      const parent = await Parent.findById(id);
      if (!parent) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parent not found');
      }

      // If children are being updated, verify they exist and belong to the same school
      if (updateData.children) {
        const children = await Student.find({
          _id: { $in: updateData.children },
          schoolId: parent.schoolId,
        });

        if (children.length !== updateData.children.length) {
          throw new AppError(httpStatus.BAD_REQUEST, 'One or more students not found in the school');
        }

        // Update old children to remove parent reference
        await Student.updateMany(
          { parentId: parent._id },
          { $unset: { parentId: 1 } }
        );

        // Update new children with parent reference
        await Student.updateMany(
          { _id: { $in: updateData.children } },
          { parentId: parent._id }
        );
      }

      const updatedParent = await Parent.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('userId', 'firstName lastName username email phone')
        .populate('schoolId', 'name')
        .populate('children', 'studentId grade section rollNumber userId')
        .lean();

      return this.formatParentResponse(updatedParent!);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to update parent: ${(error as Error).message}`
      );
    }
  }

  async deleteParent(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid parent ID format');
      }

      const parent = await Parent.findById(id);
      if (!parent) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parent not found');
      }

      // Remove parent reference from students
      await Student.updateMany(
        { parentId: parent._id },
        { $unset: { parentId: 1 } }
      );

      // Delete associated user account
      if (parent.userId) {
        await User.findByIdAndDelete(parent.userId);
      }

      await parent.deleteOne();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to delete parent: ${(error as Error).message}`
      );
    }
  }

  async getParentStats(schoolId: string): Promise<IParentStats> {
    try {
      if (!Types.ObjectId.isValid(schoolId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid school ID format');
      }

      const [totalParents, activeParents, relationshipStats, communicationStats, childrenCountStats, recentRegistrations] = await Promise.all([
        Parent.countDocuments({ schoolId }),
        Parent.countDocuments({ schoolId, isActive: true }),
        Parent.aggregate([
          { $match: { schoolId: new Types.ObjectId(schoolId) } },
          { $group: { _id: '$relationship', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Parent.aggregate([
          { $match: { schoolId: new Types.ObjectId(schoolId) } },
          { $group: { _id: '$preferences.communicationMethod', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Parent.aggregate([
          { $match: { schoolId: new Types.ObjectId(schoolId) } },
          { $group: { _id: { $size: '$children' }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Parent.countDocuments({
          schoolId,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }),
      ]);

      return {
        totalParents,
        activeParents,
        byRelationship: relationshipStats.map(stat => ({ relationship: stat._id, count: stat.count })),
        byCommunicationPreference: communicationStats.map(stat => ({ method: stat._id, count: stat.count })),
        byChildrenCount: childrenCountStats.map(stat => ({ childrenCount: stat._id, parentCount: stat.count })),
        recentRegistrations,
      };
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch parent stats: ${(error as Error).message}`
      );
    }
  }

  private formatParentResponse(parent: any): IParentResponse {
    return {
      id: parent._id?.toString() || parent.id,
      userId: parent.userId?._id?.toString() || parent.userId?.toString(),
      schoolId: parent.schoolId?._id?.toString() || parent.schoolId?.toString(),
      parentId: parent.parentId,
      children: parent.children?.map((child: any) => ({
        id: child._id?.toString() || child.id,
        studentId: child.studentId,
        fullName: child.userId ? `${child.userId.firstName} ${child.userId.lastName}`.trim() : '',
        grade: child.grade,
        section: child.section,
        rollNumber: child.rollNumber,
      })) || [],
      childrenCount: parent.children?.length || 0,
      relationship: parent.relationship,
      occupation: parent.occupation,
      qualification: parent.qualification,
      monthlyIncome: parent.monthlyIncome,
      address: parent.address,
      emergencyContact: parent.emergencyContact,
      preferences: parent.preferences || {
        communicationMethod: 'All',
        receiveNewsletters: true,
        receiveAttendanceAlerts: true,
        receiveExamResults: true,
        receiveEventNotifications: true,
      },
      isActive: parent.isActive !== false,
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
      user: parent.userId ? {
        id: parent.userId._id?.toString() || parent.userId.id,
        username: parent.userId.username,
        firstName: parent.userId.firstName,
        lastName: parent.userId.lastName,
        fullName: `${parent.userId.firstName} ${parent.userId.lastName}`.trim(),
        email: parent.userId.email,
        phone: parent.userId.phone,
      } : undefined,
      school: parent.schoolId?.name ? {
        id: parent.schoolId._id?.toString() || parent.schoolId.id,
        name: parent.schoolId.name,
      } : undefined,
    };
  }
}

export const parentService = new ParentService();