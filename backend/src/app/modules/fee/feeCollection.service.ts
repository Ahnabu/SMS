import StudentFeeRecord from "./studentFeeRecord.model";
import FeeTransaction from "./feeTransaction.model";
import FeeStructure from "./feeStructure.model";
import { Month, PaymentMethod, TransactionType } from "./fee.interface";
import {AppError} from "../../errors/AppError";
import { model } from "mongoose";

const Student = model("Student");

/**
 * Fee Collection Service
 * Handles fee collection operations by accountants
 */
class FeeCollectionService {
  /**
   * Search student by student ID
   */
  async searchStudent(studentId: string, schoolId: string) {
    const student = await Student.findOne({
      studentId,
      schoolId: schoolId,
    })
      .populate('userId', 'firstName lastName email phone')
      .select("studentId grade rollNumber userId");

    if (!student) {
      throw new AppError(404, "Student not found");
    }

    const userId = student.userId as any;
    const fullName = userId ? `${userId.firstName || ''} ${userId.lastName || ''}`.trim() : 'Unknown';

    return {
      _id: student._id,
      studentId: student.studentId,
      name: fullName,
      grade: student.grade,
      rollNumber: student.rollNumber,
      parentContact: userId?.phone || '',
    };
  }

  /**
   * Get student fee status
   */
  async getStudentFeeStatus(
    studentId: string,
    schoolId: string,
    academicYear?: string
  ) {
    // Find student by _id (not studentId string) and populate userId for name
    const student = await Student.findById(studentId)
      .populate('userId', 'firstName lastName email phone')
      .select("studentId grade rollNumber userId schoolId");

    if (!student) {
      throw new AppError(404, "Student not found");
    }

    // Verify student belongs to the accountant's school
    if (student.schoolId.toString() !== schoolId) {
      throw new AppError(403, "Access denied. Student belongs to a different school.");
    }

    const userId = student.userId as any;
    const studentName = userId ? `${userId.firstName || ''} ${userId.lastName || ''}`.trim() : 'Unknown';

    // Get current academic year if not provided
    const currentYear = academicYear || this.getCurrentAcademicYear();

    // Get or create fee record
    let feeRecord = await StudentFeeRecord.findOne({
      student: student._id,
      academicYear: currentYear,
    }).populate("feeStructure");

    if (!feeRecord) {
      // Create fee record if it doesn't exist
      const feeStructure = await FeeStructure.findOne({
        school: schoolId,
        grade: student.grade,
        academicYear: currentYear,
        isActive: true,
      });

      if (!feeStructure) {
        throw new AppError(
          404,
          `No fee structure found for grade ${student.grade} in ${currentYear}`
        );
      }

      feeRecord = await StudentFeeRecord.create({
        student: student._id,
        school: schoolId,
        grade: student.grade,
        academicYear: currentYear,
        feeStructure: feeStructure._id,
        totalFeeAmount: feeStructure.totalAmount * 12,
        totalPaidAmount: 0,
        totalDueAmount: feeStructure.totalAmount * 12,
        monthlyPayments: this.generateMonthlyPayments(
          feeStructure.totalAmount,
          feeStructure.dueDate,
          currentYear
        ),
        status: "pending",
      });
    }

    // Get upcoming due (first unpaid month)
    const now = new Date();
    const upcomingDue = feeRecord.monthlyPayments.find(
      (p: any) =>
        (p.status === "pending" || p.status === "overdue") &&
        !p.waived
    );

    // Get recent transactions
    const recentTransactions = await FeeTransaction.find({
      student: student._id,
      studentFeeRecord: feeRecord._id,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("collectedBy", "firstName lastName email");

    return {
      student: {
        _id: student._id,
        studentId: student.studentId,
        name: studentName,
        grade: student.grade,
        rollNumber: student.rollNumber,
      },
      feeRecord,
      upcomingDue: upcomingDue
        ? {
            month: upcomingDue.month,
            amount: upcomingDue.dueAmount,
            dueDate: upcomingDue.dueDate,
          }
        : undefined,
      recentTransactions,
    };
  }

  /**
   * Validate fee collection before processing
   */
  async validateFeeCollection(
    studentId: string,
    schoolId: string,
    month: Month,
    amount: number
  ) {
    const status = await this.getStudentFeeStatus(studentId, schoolId);
    const monthlyPayment = status.feeRecord.monthlyPayments.find(
      (p: any) => p.month === month
    );

    if (!monthlyPayment) {
      throw new AppError(400, "Invalid month selected");
    }

    const warnings = [];
    const errors = [];

    // Check if already paid
    if (monthlyPayment.status === "paid") {
      errors.push("This month's fee is already fully paid");
    }

    // Check if waived
    if (monthlyPayment.waived) {
      errors.push("This month's fee has been waived");
    }

    // Check amount mismatch
    const expectedAmount =
      monthlyPayment.dueAmount - monthlyPayment.paidAmount + (monthlyPayment.lateFee || 0);

    if (amount > expectedAmount) {
      warnings.push(
        `Amount exceeds due amount. Due: ${expectedAmount}, Received: ${amount}`
      );
    }

    if (amount < expectedAmount) {
      warnings.push(
        `Partial payment. Due: ${expectedAmount}, Received: ${amount}, Remaining: ${
          expectedAmount - amount
        }`
      );
    }

    // Check for overdue
    const now = new Date();
    if (monthlyPayment.dueDate < now && monthlyPayment.status === "pending") {
      warnings.push(
        `Payment is overdue by ${Math.floor(
          (now.getTime() - monthlyPayment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        )} days`
      );
    }

    // Check for out-of-sequence payment
    const previousMonths = status.feeRecord.monthlyPayments.filter(
      (p: any) => p.month < month && p.status !== "paid" && !p.waived
    );

    if (previousMonths.length > 0) {
      warnings.push(
        `${previousMonths.length} previous month(s) are still pending`
      );
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
      monthlyPayment: {
        month: monthlyPayment.month,
        dueAmount: monthlyPayment.dueAmount,
        paidAmount: monthlyPayment.paidAmount,
        lateFee: monthlyPayment.lateFee,
        status: monthlyPayment.status,
        dueDate: monthlyPayment.dueDate,
      },
      expectedAmount,
    };
  }

  /**
   * Collect fee payment
   */
  async collectFee(data: {
    studentId: string;
    schoolId: string;
    month: Month;
    amount: number;
    paymentMethod: PaymentMethod;
    collectedBy: string;
    remarks?: string;
    auditInfo?: {
      ipAddress?: string;
      deviceInfo?: string;
    };
  }) {
    // Validate first
    const validation = await this.validateFeeCollection(
      data.studentId,
      data.schoolId,
      data.month,
      data.amount
    );

    if (!validation.valid) {
      throw new AppError(400, validation.errors.join("; "));
    }

    // Get student and fee record
    const status = await this.getStudentFeeStatus(data.studentId, data.schoolId);

    // Record payment in fee record
    await status.feeRecord.recordPayment(data.month, data.amount);

    // Create transaction
    const transaction = await FeeTransaction.create({
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      student: status.student._id,
      studentFeeRecord: status.feeRecord._id,
      school: data.schoolId,
      transactionType: TransactionType.PAYMENT,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      month: data.month,
      collectedBy: data.collectedBy,
      remarks: data.remarks,
      status: "completed",
      auditLog: {
        ipAddress: data.auditInfo?.ipAddress,
        deviceInfo: data.auditInfo?.deviceInfo,
        timestamp: new Date(),
      },
    });

    return {
      success: true,
      transaction,
      feeRecord: status.feeRecord,
      warnings: validation.warnings,
    };
  }

  /**
   * Get accountant's transactions for a date
   */
  async getAccountantTransactions(
    accountantId: string,
    schoolId: string,
    startDate: Date,
    endDate: Date
  ) {
    const transactions = await FeeTransaction.find({
      school: schoolId,
      collectedBy: accountantId,
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate({
        path: "student",
        select: "studentId grade rollNumber userId",
        populate: {
          path: "userId",
          select: "firstName lastName email phone"
        }
      })
      .sort({ createdAt: -1 });

    return transactions;
  }

  /**
   * Get daily collection summary for accountant
   */
  async getDailyCollectionSummary(
    accountantId: string,
    schoolId: string,
    date: Date
  ) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const summary = await FeeTransaction.aggregate([
      {
        $match: {
          school: schoolId,
          collectedBy: accountantId,
          transactionType: TransactionType.PAYMENT,
          status: "completed",
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalCollected = summary.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalTransactions = summary.reduce((sum, s) => sum + s.count, 0);

    return {
      date,
      totalCollected,
      totalTransactions,
      byPaymentMethod: summary,
    };
  }

  /**
   * Get accountant dashboard data
   */
  async getAccountantDashboard(accountantId: string, schoolId: string) {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Start of current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Today's collections
    const todayCollections = await FeeTransaction.aggregate([
      {
        $match: {
          school: schoolId,
          transactionType: TransactionType.PAYMENT,
          status: "completed",
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Month's collections
    const monthCollections = await FeeTransaction.aggregate([
      {
        $match: {
          school: schoolId,
          transactionType: TransactionType.PAYMENT,
          status: "completed",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Pending dues across all students
    const pendingDues = await StudentFeeRecord.aggregate([
      {
        $match: {
          school: schoolId,
          academicYear: this.getCurrentAcademicYear(),
        },
      },
      {
        $group: {
          _id: null,
          totalDue: { $sum: "$totalDueAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Defaulters count (students with overdue payments)
    const defaultersCount = await StudentFeeRecord.countDocuments({
      school: schoolId,
      academicYear: this.getCurrentAcademicYear(),
      "monthlyPayments": {
        $elemMatch: {
          status: "overdue",
          waived: false,
        },
      },
    });

    // Recent transactions
    const recentTransactions = await FeeTransaction.find({
      school: schoolId,
      transactionType: TransactionType.PAYMENT,
      status: "completed",
    })
      .populate({
        path: "student",
        select: "studentId grade section rollNumber userId",
        populate: {
          path: "userId",
          select: "firstName lastName email phone"
        }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Monthly collection breakdown by fee type
    const monthlyBreakdown = await FeeTransaction.aggregate([
      {
        $match: {
          school: schoolId,
          transactionType: TransactionType.PAYMENT,
          status: "completed",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $lookup: {
          from: "feesstructures",
          localField: "studentFeeRecord",
          foreignField: "_id",
          as: "feeStructure",
        },
      },
      {
        $unwind: { path: "$feeStructure", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      totalCollections: todayCollections[0]?.totalAmount || 0,
      todayTransactions: todayCollections[0]?.count || 0,
      monthlyTarget: monthCollections[0]?.totalAmount || 0,
      monthlyTransactions: monthCollections[0]?.count || 0,
      pendingDues: pendingDues[0]?.totalDue || 0,
      totalDefaulters: defaultersCount,
      recentTransactions: recentTransactions.map((t: any) => {
        const userId = t.student?.userId;
        const studentName = userId ? `${userId.firstName || ''} ${userId.lastName || ''}`.trim() : "Unknown";
        
        return {
          _id: t._id,
          transactionId: t.transactionId,
          studentName,
          studentId: t.student?.studentId,
          grade: t.student?.grade,
          section: t.student?.section,
          amount: t.amount,
          paymentMethod: t.paymentMethod,
          date: t.createdAt,
          month: t.month,
        };
      }),
      tuitionCollection: 0, // These would need more detailed tracking
      examCollection: 0,
      transportCollection: 0,
      otherCollection: 0,
      monthlyBreakdown,
    };
  }

  /**
   * Get students by grade and section
   */
  async getStudentsByGradeSection(
    schoolId: string,
    grade?: number,
    section?: string
  ) {
    const query: any = { schoolId: schoolId, isActive: true };
    
    if (grade) query.grade = grade;
    if (section) query.section = section;

    const students = await Student.find(query)
      .populate('userId', 'firstName lastName email phone')
      .select("studentId grade section rollNumber userId")
      .sort({ grade: 1, section: 1, rollNumber: 1 })
      .lean();

    // Get fee status for each student
    const studentsWithFees = await Promise.all(
      students.map(async (student: any) => {
        const feeRecord = await StudentFeeRecord.findOne({
          student: student._id,
          academicYear: this.getCurrentAcademicYear(),
        });

        const userId = student.userId as any;
        const fullName = userId ? `${userId.firstName || ''} ${userId.lastName || ''}`.trim() : 'Unknown';

        return {
          _id: student._id,
          studentId: student.studentId,
          name: fullName,
          grade: student.grade,
          section: student.section,
          rollNumber: student.rollNumber,
          parentContact: userId?.phone || '',
          feeStatus: feeRecord ? {
            totalFeeAmount: feeRecord.totalFeeAmount,
            totalPaidAmount: feeRecord.totalPaidAmount,
            totalDueAmount: feeRecord.totalDueAmount,
            status: feeRecord.status,
            pendingMonths: feeRecord.monthlyPayments.filter(
              (p: any) => p.status === "pending" || p.status === "overdue"
            ).length,
          } : null,
        };
      })
    );

    return studentsWithFees;
  }

  /**
   * Helper: Get current academic year
   */
  private getCurrentAcademicYear(): string {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Academic year starts in April (month 4)
    if (currentMonth >= 4) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      return `${currentYear - 1}-${currentYear}`;
    }
  }

  /**
   * Helper: Generate monthly payments array
   */
  private generateMonthlyPayments(
    monthlyAmount: number,
    dueDate: number,
    academicYear: string
  ) {
    const payments = [];
    const startYear = parseInt(academicYear.split("-")[0]);

    for (let i = 0; i < 12; i++) {
      const month = ((Month.APRIL + i - 1) % 12) + 1;
      const year = startYear + (month < Month.APRIL ? 1 : 0);

      payments.push({
        month,
        dueAmount: monthlyAmount,
        paidAmount: 0,
        status: "pending",
        dueDate: new Date(year, month - 1, dueDate),
        lateFee: 0,
        waived: false,
      });
    }

    return payments;
  }
}

export default new FeeCollectionService();
