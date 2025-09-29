import { startSession, Types } from "mongoose";
import httpStatus from "http-status";
import { AppError } from "../../errors/AppError";
import { Schedule } from "./schedule.model";
import {
  ICreateScheduleRequest,
  IUpdateScheduleRequest,
  IScheduleFilters,
  IWeeklySchedule,
  ITeacherWorkload,
  IScheduleStats,
  IScheduleDocument,
} from "./schedule.interface";
import { School } from "../school/school.model";
import { Subject } from "../subject/subject.model";
import { Teacher } from "../teacher/teacher.model";
import { Class } from "../class/class.model";

const createSchedule = async (
  scheduleData: ICreateScheduleRequest
): Promise<IScheduleDocument> => {
  const session = await startSession();
  console.log("scheduleData:", scheduleData);
  try {
    session.startTransaction();
    // Validate schoolId format and convert to ObjectId if needed
    if (!scheduleData.schoolId) {
      throw new AppError(httpStatus.BAD_REQUEST, "School ID is required");
    }

    let schoolObjectId;
    try {
      schoolObjectId = new Types.ObjectId(scheduleData.schoolId);
    } catch (error) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid school ID format");
    }

    // Validate school exists
    const school = await School.findById(schoolObjectId).session(session);

    console.log("Looking for school with ID:", scheduleData.schoolId);
    console.log("School found:", school);

    if (!school) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `School not found with ID: ${scheduleData.schoolId}`
      );
    }

    if (!school.isActive) {
      throw new AppError(httpStatus.BAD_REQUEST, "School is not active");
    }

    // Find or create the class for this grade and section
    let classDoc = await Class.findOne({
      schoolId: scheduleData.schoolId,
      grade: scheduleData.grade,
      section: scheduleData.section,
      academicYear: scheduleData.academicYear,
    }).session(session);

    if (!classDoc) {
      // Create the class if it doesn't exist
      classDoc = new Class({
        schoolId: scheduleData.schoolId,
        grade: scheduleData.grade,
        section: scheduleData.section,
        className: `Grade ${scheduleData.grade} - Section ${scheduleData.section}`,
        academicYear: scheduleData.academicYear,
        maxStudents: school.settings?.maxStudentsPerSection || 40,
        isActive: true,
      });
      await classDoc.save({ session });
    }

    // Validate all subjects exist
    const subjectIds = scheduleData.periods
      .filter((period) => !period.isBreak && period.subjectId)
      .map((period) => period.subjectId);

    if (subjectIds.length > 0) {
      const subjects = await Subject.find({ _id: { $in: subjectIds } }).session(
        session
      );
      if (subjects.length !== subjectIds.length) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          "One or more subjects not found"
        );
      }
    }

    // Validate all teachers exist
    const teacherIds = scheduleData.periods
      .filter((period) => !period.isBreak && period.teacherId)
      .map((period) => period.teacherId);

    if (teacherIds.length > 0) {
      const teachers = await Teacher.find({ _id: { $in: teacherIds } }).session(
        session
      );
      if (teachers.length !== teacherIds.length) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          "One or more teachers not found"
        );
      }
    }

    // Check if schedule already exists for this class and day
    const existingSchedule = await Schedule.findOne({
      schoolId: schoolObjectId,
      grade: scheduleData.grade,
      section: scheduleData.section,
      dayOfWeek: scheduleData.dayOfWeek,
      academicYear: scheduleData.academicYear,
      isActive: true,
    }).session(session);

    if (existingSchedule) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Schedule already exists for this class and day"
      );
    }

    // Check teacher conflicts
    for (const period of scheduleData.periods) {
      if (!period.isBreak && period.teacherId) {
        const hasConflict = await Schedule.checkTeacherConflict(
          period.teacherId,
          scheduleData.dayOfWeek,
          period.periodNumber
        );

        if (hasConflict) {
          throw new AppError(
            httpStatus.CONFLICT,
            `Teacher has a conflict on ${scheduleData.dayOfWeek} period ${period.periodNumber}`
          );
        }
      }
    }

    // Create the schedule with properly converted ObjectId and classId
    const newSchedule = new Schedule({
      ...scheduleData,
      schoolId: scheduleData.schoolId,
      classId: classDoc._id,
    });
    await newSchedule.save({ session });

    await session.commitTransaction();

    const result = await Schedule.findById(newSchedule._id)
      .populate("schoolId", "name")
      .populate("periods.subjectId", "name code")
      .populate({
        path: "periods.teacherId",
        select: "userId teacherId",
        populate: {
          path: "userId",
          select: "firstName lastName",
        },
      });

    if (!result) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to retrieve created schedule"
      );
    }

    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllSchedules = async (
  filters: IScheduleFilters,
  pagination: { page: number; limit: number }
) => {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const query: any = {};

  if (filters.schoolId) query.schoolId = filters.schoolId;
  if (filters.grade) query.grade = filters.grade;
  if (filters.section) query.section = filters.section;
  if (filters.dayOfWeek) query.dayOfWeek = filters.dayOfWeek;
  if (filters.academicYear) query.academicYear = filters.academicYear;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;

  if (filters.teacherId) {
    query["periods.teacherId"] = filters.teacherId;
  }

  if (filters.subjectId) {
    query["periods.subjectId"] = filters.subjectId;
  }

  const [schedules, totalCount] = await Promise.all([
    Schedule.find(query)
      .populate("schoolId", "name")
      .populate("periods.subjectId", "name code")
      .populate({
        path: "periods.teacherId",
        select: "userId teacherId",
        populate: {
          path: "userId",
          select: "firstName lastName",
        },
      })
      .sort({ grade: 1, section: 1, dayOfWeek: 1 })
      .skip(skip)
      .limit(limit),
    Schedule.countDocuments(query),
  ]);

  return {
    schedules,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
  };
};

const getScheduleById = async (
  scheduleId: string
): Promise<IScheduleDocument> => {
  const schedule = await Schedule.findById(scheduleId)
    .populate("schoolId", "name")
    .populate("periods.subjectId", "name code")
    .populate({
      path: "periods.teacherId",
      select: "userId teacherId",
      populate: {
        path: "userId",
        select: "firstName lastName",
      },
    });

  if (!schedule) {
    throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
  }

  return schedule;
};

const updateSchedule = async (
  scheduleId: string,
  updateData: IUpdateScheduleRequest,
  userSchoolId?: string
): Promise<IScheduleDocument> => {
  const session = await startSession();

  try {
    session.startTransaction();

    // Build query to include school validation if userSchoolId provided
    const query: any = { _id: scheduleId };
    if (userSchoolId) {
      query.schoolId = userSchoolId;
    }

    const schedule = await Schedule.findOne(query).session(session);
    if (!schedule) {
      throw new AppError(httpStatus.NOT_FOUND, "Schedule not found or access denied");
    }

    // If updating periods, validate teachers and subjects
    if (updateData.periods) {
      const subjectIds = updateData.periods
        .filter((period) => !period.isBreak && period.subjectId)
        .map((period) => period.subjectId);

      if (subjectIds.length > 0) {
        const subjects = await Subject.find({
          _id: { $in: subjectIds },
          schoolId: schedule.schoolId, // Filter by school
        }).session(session);
        if (subjects.length !== subjectIds.length) {
          throw new AppError(
            httpStatus.NOT_FOUND,
            "One or more subjects not found in this school"
          );
        }
      }

      const teacherIds = updateData.periods
        .filter((period) => !period.isBreak && period.teacherId)
        .map((period) => period.teacherId);

      if (teacherIds.length > 0) {
        const teachers = await Teacher.find({
          _id: { $in: teacherIds },
          schoolId: schedule.schoolId, // Filter by school
        }).session(session);
        if (teachers.length !== teacherIds.length) {
          throw new AppError(
            httpStatus.NOT_FOUND,
            "One or more teachers not found in this school"
          );
        }
      }

      // Check teacher conflicts for new periods
      for (const period of updateData.periods) {
        if (!period.isBreak && period.teacherId) {
          const hasConflict = await Schedule.checkTeacherConflict(
            period.teacherId,
            schedule.dayOfWeek,
            period.periodNumber,
            scheduleId
          );

          if (hasConflict) {
            throw new AppError(
              httpStatus.CONFLICT,
              `Teacher has a conflict on ${schedule.dayOfWeek} period ${period.periodNumber}`
            );
          }
        }
      }
    }

    // Update the schedule
    Object.assign(schedule, updateData);
    await schedule.save({ session });

    await session.commitTransaction();

    const result = await Schedule.findById(scheduleId)
      .populate("schoolId", "name")
      .populate("periods.subjectId", "name code")
      .populate({
        path: "periods.teacherId",
        select: "userId teacherId",
        populate: {
          path: "userId",
          select: "firstName lastName",
        },
      });

    if (!result) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to retrieve updated schedule"
      );
    }

    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const deleteSchedule = async (scheduleId: string, userSchoolId?: string): Promise<void> => {
  // Build query to include school validation if userSchoolId provided
  const query: any = { _id: scheduleId };
  if (userSchoolId) {
    query.schoolId = userSchoolId;
  }

  const schedule = await Schedule.findOne(query);
  if (!schedule) {
    throw new AppError(httpStatus.NOT_FOUND, "Schedule not found or access denied");
  }

  // Soft delete by setting isActive to false
  schedule.isActive = false;
  await schedule.save();
};

const getWeeklySchedule = async (
  schoolId: string,
  grade: number,
  section: string
): Promise<IWeeklySchedule> => {
  const school = await School.findById(schoolId);
  if (!school) {
    throw new AppError(httpStatus.NOT_FOUND, "School not found");
  }

  return await Schedule.generateWeeklySchedule(schoolId, grade, section);
};

const getTeacherSchedule = async (
  teacherId: string
): Promise<ITeacherWorkload> => {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  return await Schedule.getTeacherWorkload(teacherId);
};

const assignSubstituteTeacher = async (
  scheduleId: string,
  periodNumber: number,
  substituteTeacherId: string,
  startDate: Date,
  endDate?: Date,
  reason?: string
): Promise<IScheduleDocument> => {
  const session = await startSession();

  try {
    session.startTransaction();

    const schedule = await Schedule.findById(scheduleId).session(session);
    if (!schedule) {
      throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
    }

    const teacher = await Teacher.findById(substituteTeacherId).session(
      session
    );
    if (!teacher) {
      throw new AppError(httpStatus.NOT_FOUND, "Substitute teacher not found");
    }

    const period = schedule.periods.find(
      (p) => p.periodNumber === periodNumber
    );
    if (!period) {
      throw new AppError(httpStatus.NOT_FOUND, "Period not found");
    }

    if (period.isBreak) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot assign substitute teacher to break period"
      );
    }

    // Check if substitute teacher has conflicts
    const hasConflict = await Schedule.checkTeacherConflict(
      substituteTeacherId,
      schedule.dayOfWeek,
      periodNumber,
      scheduleId
    );

    if (hasConflict) {
      throw new AppError(
        httpStatus.CONFLICT,
        `Substitute teacher has a conflict on ${schedule.dayOfWeek} period ${periodNumber}`
      );
    }

    // Update the period with substitute teacher info
    period.teacherId = substituteTeacherId as any;

    await schedule.save({ session });
    await session.commitTransaction();

    const result = await Schedule.findById(scheduleId)
      .populate("schoolId", "name")
      .populate("periods.subjectId", "name code")
      .populate({
        path: "periods.teacherId",
        select: "userId teacherId",
        populate: {
          path: "userId",
          select: "firstName lastName",
        },
      });

    if (!result) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to retrieve schedule with substitute teacher"
      );
    }

    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getScheduleStats = async (schoolId: string): Promise<IScheduleStats> => {
  const school = await School.findById(schoolId);
  if (!school) {
    throw new AppError(httpStatus.NOT_FOUND, "School not found");
  }

  const [
    totalSchedules,
    activeSchedules,
    gradeStats,
    dayStats,
    teacherSchedules,
    subjectSchedules,
  ] = await Promise.all([
    Schedule.countDocuments({ schoolId }),
    Schedule.countDocuments({ schoolId, isActive: true }),
    Schedule.aggregate([
      { $match: { schoolId: schoolId as any } },
      {
        $group: {
          _id: "$grade",
          scheduleCount: { $sum: 1 },
          sections: { $addToSet: "$section" },
        },
      },
      {
        $project: {
          grade: "$_id",
          scheduleCount: 1,
          sectionsCount: { $size: "$sections" },
        },
      },
      { $sort: { grade: 1 } },
    ]),
    Schedule.aggregate([
      { $match: { schoolId: schoolId as any } },
      { $group: { _id: "$dayOfWeek", scheduleCount: { $sum: 1 } } },
      { $project: { dayOfWeek: "$_id", scheduleCount: 1 } },
    ]),
    Schedule.aggregate([
      { $match: { schoolId: schoolId as any, isActive: true } },
      { $unwind: "$periods" },
      { $match: { "periods.isBreak": { $ne: true } } },
      {
        $group: {
          _id: "$periods.teacherId",
          totalPeriods: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "teachers",
          localField: "_id",
          foreignField: "_id",
          as: "teacher",
        },
      },
      { $unwind: "$teacher" },
      {
        $lookup: {
          from: "users",
          localField: "teacher.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          teacherId: "$_id",
          teacherName: { $concat: ["$user.firstName", " ", "$user.lastName"] },
          totalPeriods: 1,
          utilizationPercentage: {
            $multiply: [{ $divide: ["$totalPeriods", 30] }, 100],
          },
        },
      },
      { $sort: { totalPeriods: -1 } },
    ]),
    Schedule.aggregate([
      { $match: { schoolId: schoolId as any, isActive: true } },
      { $unwind: "$periods" },
      { $match: { "periods.isBreak": { $ne: true } } },
      {
        $group: {
          _id: "$periods.subjectId",
          totalPeriods: { $sum: 1 },
          classes: { $addToSet: { grade: "$grade", section: "$section" } },
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "_id",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: "$subject" },
      {
        $project: {
          subjectId: "$_id",
          subjectName: "$subject.name",
          totalPeriods: 1,
          classesCount: { $size: "$classes" },
        },
      },
      { $sort: { totalPeriods: -1 } },
    ]),
  ]);

  return {
    totalSchedules,
    activeSchedules,
    byGrade: gradeStats,
    byDayOfWeek: dayStats,
    teacherUtilization: teacherSchedules,
    subjectDistribution: subjectSchedules,
  };
};

const bulkCreateSchedules = async (
  schedulesData: ICreateScheduleRequest[]
): Promise<IScheduleDocument[]> => {
  const session = await startSession();

  try {
    session.startTransaction();

    // Validate all schools exist
    const schoolIds = [...new Set(schedulesData.map((s) => s.schoolId))];
    const schools = await School.find({ _id: { $in: schoolIds } }).session(
      session
    );
    if (schools.length !== schoolIds.length) {
      throw new AppError(httpStatus.NOT_FOUND, "One or more schools not found");
    }

    // Check for conflicts
    for (const scheduleData of schedulesData) {
      const existingSchedule = await Schedule.findOne({
        schoolId: scheduleData.schoolId,
        grade: scheduleData.grade,
        section: scheduleData.section,
        dayOfWeek: scheduleData.dayOfWeek,
        academicYear: scheduleData.academicYear,
        isActive: true,
      }).session(session);

      if (existingSchedule) {
        throw new AppError(
          httpStatus.CONFLICT,
          `Schedule already exists for Grade ${scheduleData.grade} Section ${scheduleData.section} on ${scheduleData.dayOfWeek}`
        );
      }
    }

    const schedules = await Schedule.insertMany(schedulesData, { session });
    await session.commitTransaction();

    return schedules;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const ScheduleService = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getWeeklySchedule,
  getTeacherSchedule,
  assignSubstituteTeacher,
  getScheduleStats,
  bulkCreateSchedules,
};
