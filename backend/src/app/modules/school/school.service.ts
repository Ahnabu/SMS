import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { AppError } from '../../errors/AppError';
import { Organization } from '../organization/organization.model';
import { School } from './school.model';
import {
  ICreateSchoolRequest,
  IUpdateSchoolRequest,
  ISchoolResponse,
  ISchoolDocument,
  ISchoolCredentials,
} from './school.interface';

class SchoolService {
  async createSchool(
    schoolData: ICreateSchoolRequest
  ): Promise<{ school: ISchoolResponse; credentials: ISchoolCredentials }> {
    try {
      // Verify organization exists and is active
      const organization = await Organization.findById(schoolData.orgId);
      if (!organization) {
        throw new AppError(httpStatus.NOT_FOUND, 'Organization not found');
      }

      if (organization.status !== 'active') {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Cannot create school for inactive organization'
        );
      }

      // Check if school with same name already exists in this organization
      const existingSchool = await School.findOne({
        name: { $regex: new RegExp(`^${schoolData.name}$`, 'i') },
        orgId: schoolData.orgId,
      });

      if (existingSchool) {
        throw new AppError(
          httpStatus.CONFLICT,
          `School with name '${schoolData.name}' already exists in this organization`
        );
      }

      // Create temporary school instance to generate credentials
      const tempSchool = new School({
        ...schoolData,
        adminUsername: 'temp',
        adminPasswordHash: 'temp',
      });

      // Generate unique admin credentials
      let credentials: { username: string; password: string };
      let attempts = 0;
      const maxAttempts = 10;

      do {
        credentials = tempSchool.generateCredentials();
        const usernameExists = await School.findOne({
          adminUsername: credentials.username,
        });

        if (!usernameExists) break;
        attempts++;
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to generate unique admin username after multiple attempts'
        );
      }

      // Create the school with generated credentials
      const newSchool = await School.create({
        ...schoolData,
        adminUsername: credentials.username,
        adminPasswordHash: credentials.password,
      });

      // Populate organization data
      await newSchool.populate('orgId', 'name status');

      return {
        school: this.formatSchoolResponse(newSchool),
        credentials: {
          username: credentials.username,
          password: credentials.password,
          tempPassword: credentials.password, // Same as password initially
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to create school: ${error.message}`
      );
    }
  }

  async getSchools(queryParams: {
    page: number;
    limit: number;
    orgId?: string;
    status?: string;
    search?: string;
    sortBy: string;
    sortOrder: string;
  }): Promise<{
    schools: ISchoolResponse[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    try {
      const { page, limit, orgId, status, search, sortBy, sortOrder } = queryParams;
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {};

      if (orgId) {
        query.orgId = orgId;
      }

      if (status && status !== 'all') {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { name: { $regex: new RegExp(search, 'i') } },
          { address: { $regex: new RegExp(search, 'i') } },
          { adminUsername: { $regex: new RegExp(search, 'i') } },
        ];
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute queries
      const [schools, totalCount] = await Promise.all([
        School.find(query)
          .populate('orgId', 'name status')
          .populate('studentsCount')
          .populate('teachersCount')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        School.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        schools: schools.map(school => this.formatSchoolResponse(school)),
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch schools: ${error.message}`
      );
    }
  }

  async getSchoolById(id: string): Promise<ISchoolResponse> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid school ID format');
      }

      const school = await School.findById(id)
        .populate('orgId', 'name status')
        .populate('studentsCount')
        .populate('teachersCount')
        .lean();

      if (!school) {
        throw new AppError(httpStatus.NOT_FOUND, 'School not found');
      }

      return this.formatSchoolResponse(school);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch school: ${error.message}`
      );
    }
  }

  async updateSchool(
    id: string,
    updateData: IUpdateSchoolRequest
  ): Promise<ISchoolResponse> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid school ID format');
      }

      // Check if school exists
      const school = await School.findById(id);
      if (!school) {
        throw new AppError(httpStatus.NOT_FOUND, 'School not found');
      }

      // If updating name, check for duplicates in the same organization
      if (updateData.name && updateData.name !== school.name) {
        const existingSchool = await School.findOne({
          name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
          orgId: school.orgId,
          _id: { $ne: id },
        });

        if (existingSchool) {
          throw new AppError(
            httpStatus.CONFLICT,
            `School with name '${updateData.name}' already exists in this organization`
          );
        }
      }

      const updatedSchool = await School.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('orgId', 'name status')
        .populate('studentsCount')
        .populate('teachersCount')
        .lean();

      return this.formatSchoolResponse(updatedSchool!);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to update school: ${error.message}`
      );
    }
  }

  async deleteSchool(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid school ID format');
      }

      const school = await School.findById(id);
      if (!school) {
        throw new AppError(httpStatus.NOT_FOUND, 'School not found');
      }

      // The pre-delete middleware in the model will check for dependent data
      await school.deleteOne();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to delete school: ${error.message}`
      );
    }
  }

  async resetAdminPassword(id: string, newPassword: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid school ID format');
      }

      const school = await School.findById(id);
      if (!school) {
        throw new AppError(httpStatus.NOT_FOUND, 'School not found');
      }

      await school.updateAdminPassword(newPassword);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to reset admin password: ${error.message}`
      );
    }
  }

  async getSchoolsByOrganization(orgId: string): Promise<ISchoolResponse[]> {
    try {
      if (!Types.ObjectId.isValid(orgId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid organization ID format');
      }

      const schools = await School.findByOrganization(orgId);
      return schools.map(school => this.formatSchoolResponse(school));
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch schools by organization: ${error.message}`
      );
    }
  }

  async validateAdminCredentials(username: string, password: string): Promise<ISchoolDocument | null> {
    try {
      const school = await School.findByAdminUsername(username);
      if (!school) {
        return null;
      }

      const isPasswordValid = await school.validateCredentials(password);
      if (!isPasswordValid) {
        return null;
      }

      return school;
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to validate admin credentials: ${error.message}`
      );
    }
  }

  private formatSchoolResponse(school: any): ISchoolResponse {
    return {
      id: school._id?.toString() || school.id,
      orgId: school.orgId?._id?.toString() || school.orgId,
      name: school.name,
      address: school.address,
      phone: school.phone,
      email: school.email,
      adminUsername: school.adminUsername,
      status: school.status,
      settings: school.settings,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
      studentsCount: school.studentsCount || 0,
      teachersCount: school.teachersCount || 0,
      organization: school.orgId?.name ? {
        id: school.orgId._id?.toString() || school.orgId.id,
        name: school.orgId.name,
      } : undefined,
    };
  }
}

export const schoolService = new SchoolService();