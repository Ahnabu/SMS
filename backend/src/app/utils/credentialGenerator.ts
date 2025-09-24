import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Student } from "../modules/student/student.model";
import { Teacher } from "../modules/teacher/teacher.model";
import { User } from "../modules/user/user.model";

export interface GeneratedCredentials {
  username: string;
  password: string;
  hashedPassword: string;
  requiresPasswordChange: boolean;
}

export interface StudentIdComponents {
  admissionYear: number;
  grade: string;
  rollNumber: number;
}

export interface TeacherIdComponents {
  joiningYear: number;
  sequenceNumber: number;
}

export class CredentialGenerator {
  /**
   * Calculate age from date of birth
   */
  static calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Generate a unique student ID based on admission year, grade, and roll number
   * Format: YYYYGGRRR (e.g., 2025070001 for Grade 7 student)
   * Sequential logic: Students in same grade get consecutive roll numbers
   */
  static async generateUniqueStudentId(
    admissionYear: number,
    grade: string,
    schoolId: string
  ): Promise<{ studentId: string; rollNumber: number }> {
    // Convert grade to 2-digit number (pad with zero if needed)
    const gradeNumber = grade.toString().padStart(2, "0");

    // Find all existing students for this year, grade, and school
    // Sort by creation time to maintain sequential registration order
    const existingStudents = await Student.find({
      schoolId,
      admissionYear,
      grade,
      isActive: true,
    })
      .sort({ createdAt: 1, rollNumber: 1 }) // Sequential by registration time
      .exec();

    let nextRoll = 1;

    if (existingStudents.length > 0) {
      // Find the highest roll number for this specific grade
      const rollNumbers = existingStudents
        .map((student) => student.rollNumber)
        .filter(
          (roll): roll is number =>
            roll !== undefined && roll !== null && roll > 0
        )
        .sort((a, b) => a - b);

      if (rollNumbers.length > 0) {
        nextRoll = Math.max(...rollNumbers) + 1;
      }

      // Ensure sequential numbering within grade
      // Check for gaps and fill them for better organization
      for (let i = 1; i <= rollNumbers.length + 1; i++) {
        if (!rollNumbers.includes(i)) {
          nextRoll = i;
          break;
        }
      }
    }

    // Format roll number as 4-digit string (0001, 0002, etc.)
    const rollNumberStr = nextRoll.toString().padStart(4, "0");
    const studentId = `${admissionYear}${gradeNumber}${rollNumberStr}`;

    // Double-check uniqueness (extra safety)
    const existingWithId = await Student.findOne({
      studentId,
      schoolId,
      isActive: true,
    });

    if (existingWithId) {
      // If somehow this ID exists, recursively try the next number
      return this.generateUniqueStudentId(admissionYear, grade, schoolId);
    }

    return { studentId, rollNumber: nextRoll };
  }

  /**
   * Validate student ID format
   */
  static validateStudentIdFormat(studentId: string): boolean {
    const regex = /^\d{10}$/; // YYYYGGRRR format (10 digits)
    return regex.test(studentId);
  }

  /**
   * Parse student ID components
   */
  static parseStudentId(studentId: string): StudentIdComponents {
    if (!this.validateStudentIdFormat(studentId)) {
      throw new Error(
        "Invalid student ID format. Expected: YYYYGGRRR (10 digits)"
      );
    }

    return {
      admissionYear: parseInt(studentId.substring(0, 4)),
      grade: studentId.substring(4, 6),
      rollNumber: parseInt(studentId.substring(6, 10)),
    };
  }

  /**
   * Generate a secure random password
   */
  static generatePassword(length: number = 8): string {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const specialChars = "!@#$%&*";

    const allChars =
      uppercaseChars + lowercaseChars + numberChars + specialChars;

    let password = "";

    // Ensure at least one character from each category
    password +=
      uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    password +=
      lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    password += numberChars[Math.floor(Math.random() * numberChars.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to randomize positions
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  /**
   * Generate username from student ID
   */
  static generateStudentUsername(studentId: string): string {
    return `student_${studentId}`;
  }

  /**
   * Generate parent username from student ID
   */
  static generateParentUsername(studentId: string): string {
    return `parent_${studentId}`;
  }

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Generate complete credentials for a student
   */
  static async generateStudentCredentials(
    studentId: string
  ): Promise<GeneratedCredentials> {
    const username = this.generateStudentUsername(studentId);
    const password = this.generatePassword();
    const hashedPassword = await this.hashPassword(password);

    return {
      username,
      password,
      hashedPassword,
      requiresPasswordChange: true,
    };
  }

  /**
   * Generate complete credentials for a parent
   */
  static async generateParentCredentials(
    studentId: string
  ): Promise<GeneratedCredentials> {
    const username = this.generateParentUsername(studentId);
    const password = this.generatePassword();
    const hashedPassword = await this.hashPassword(password);

    return {
      username,
      password,
      hashedPassword,
      requiresPasswordChange: true,
    };
  }

  /**
   * Generate credentials for both student and parent using student ID
   */
  static async generateBothCredentials(studentId: string): Promise<{
    student: GeneratedCredentials;
    parent: GeneratedCredentials;
  }> {
    const studentCredentials = await this.generateStudentCredentials(studentId);
    const parentCredentials = await this.generateParentCredentials(studentId);

    return {
      student: studentCredentials,
      parent: parentCredentials,
    };
  }

  /**
   * Generate secure credentials for teacher
   */
  static async generateTeacherCredentials(
    firstName: string,
    lastName: string,
    teacherId: string
  ): Promise<GeneratedCredentials> {
    // Generate username from teacher ID (remove dashes, lowercase)
    const baseUsername = teacherId.replace(/-/g, "").toLowerCase();

    // Ensure username uniqueness
    let username = baseUsername;
    let counter = 1;

    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Generate secure password (teacher ID + random suffix for initial login)
    const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    const password = `${teacherId}-${randomSuffix}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    return {
      username,
      password,
      hashedPassword,
      requiresPasswordChange: true,
    };
  }

  /**
   * Check if usernames are available
   */
  static async checkUsernameAvailability(
    usernames: string[]
  ): Promise<boolean> {
    const existingUsers = await User.find({
      username: { $in: usernames },
      isActive: true,
    });

    return existingUsers.length === 0;
  }

  /**
   * Generate complete student registration data including ID and credentials
   */
  static async generateStudentRegistration(
    admissionYear: number,
    grade: string,
    schoolId: string
  ): Promise<{
    studentId: string;
    rollNumber: number;
    credentials: {
      student: GeneratedCredentials;
      parent: GeneratedCredentials;
    };
  }> {
    // Generate unique student ID
    const { studentId, rollNumber } = await this.generateUniqueStudentId(
      admissionYear,
      grade,
      schoolId
    );

    // Generate credentials
    const credentials = await this.generateBothCredentials(studentId);

    // Verify usernames are available
    const usernames = [
      credentials.student.username,
      credentials.parent.username,
    ];
    const available = await this.checkUsernameAvailability(usernames);

    if (!available) {
      // This should be rare but handle it by regenerating
      throw new Error("Generated usernames already exist. Please try again.");
    }

    return {
      studentId,
      rollNumber,
      credentials,
    };
  }

  /**
   * Generate a unique teacher ID and employee ID based on joining year and sequence
   * Format: TCH-YYYY-XXX for teacherId and EMP-YYYY-XXX for employeeId
   * Sequential logic: Earlier registered teachers get lower sequence numbers
   */
  static async generateUniqueTeacherId(
    joiningYear: number,
    schoolId: string,
    designation?: string
  ): Promise<{
    teacherId: string;
    employeeId: string;
    sequenceNumber: number;
  }> {
    // Find all existing teachers for this year and school, ordered by registration time
    const existingTeachers = await Teacher.find({
      schoolId,
      joinDate: {
        $gte: new Date(joiningYear, 0, 1),
        $lt: new Date(joiningYear + 1, 0, 1),
      },
      isActive: true,
    })
      .sort({ createdAt: 1 }) // Sort by creation time for sequential order
      .exec();

    let nextSequence = 1;

    if (existingTeachers.length > 0) {
      // For better sequencing, group by similar roles first
      let designationGroup: any[] = [];
      let otherTeachers: any[] = [];

      if (designation) {
        // Separate teachers by designation similarity for contextual grouping
        const seniorRoles = ["Principal", "Vice Principal", "Head Teacher"];
        const teachingRoles = [
          "Senior Teacher",
          "Teacher",
          "Assistant Teacher",
        ];
        const specialRoles = [
          "Subject Coordinator",
          "Sports Teacher",
          "Music Teacher",
          "Art Teacher",
        ];
        const supportRoles = ["Librarian", "Lab Assistant"];

        const getCurrentGroup = (des: string) => {
          if (seniorRoles.includes(des)) return "senior";
          if (teachingRoles.includes(des)) return "teaching";
          if (specialRoles.includes(des)) return "special";
          if (supportRoles.includes(des)) return "support";
          return "other";
        };

        const currentGroup = getCurrentGroup(designation);

        designationGroup = existingTeachers.filter(
          (t) => getCurrentGroup(t.designation) === currentGroup
        );
        otherTeachers = existingTeachers.filter(
          (t) => getCurrentGroup(t.designation) !== currentGroup
        );
      }

      // Extract sequence numbers from all existing teacher IDs
      const allSequences = existingTeachers
        .map((teacher) => {
          const match = teacher.teacherId.match(/TCH-\d{4}-(\d{3})/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter((seq) => seq > 0);

      if (allSequences.length > 0) {
        nextSequence = Math.max(...allSequences) + 1;
      }

      // For contextual grouping: if same designation group exists,
      // try to place new teacher close to similar roles
      if (designationGroup.length > 0 && designation) {
        const groupSequences = designationGroup
          .map((teacher) => {
            const match = teacher.teacherId.match(/TCH-\d{4}-(\d{3})/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter((seq) => seq > 0);

        if (groupSequences.length > 0) {
          const maxGroupSeq = Math.max(...groupSequences);
          // Try to assign next sequence after the group
          const candidateSequence = maxGroupSeq + 1;

          // Check if this sequence is available
          const sequenceExists = allSequences.includes(candidateSequence);
          if (!sequenceExists) {
            nextSequence = candidateSequence;
          }
        }
      }
    }

    // Format sequence as 3-digit string (001, 002, etc.)
    const sequenceStr = nextSequence.toString().padStart(3, "0");
    const teacherId = `TCH-${joiningYear}-${sequenceStr}`;
    const employeeId = `EMP-${joiningYear}-${sequenceStr}`;

    // Double-check uniqueness
    const existingWithId = await Teacher.findOne({
      $or: [{ teacherId }, { employeeId }],
      schoolId,
      isActive: true,
    });

    if (existingWithId) {
      // If somehow this ID exists, recursively try the next number
      return this.generateUniqueTeacherId(joiningYear, schoolId, designation);
    }

    return { teacherId, employeeId, sequenceNumber: nextSequence };
  }

  /**
   * Validate teacher ID format
   */
  static validateTeacherIdFormat(teacherId: string): boolean {
    const regex = /^TCH-\d{4}-\d{3}$/; // TCH-YYYY-XXX format
    return regex.test(teacherId);
  }

  /**
   * Parse teacher ID components
   */
  static parseTeacherId(teacherId: string): TeacherIdComponents {
    if (!this.validateTeacherIdFormat(teacherId)) {
      throw new Error("Invalid teacher ID format. Expected: TCH-YYYY-XXX");
    }

    return {
      joiningYear: parseInt(teacherId.substring(4, 8)),
      sequenceNumber: parseInt(teacherId.substring(9, 12)),
    };
  }

  /**
   * Format teacher credentials for display
   */
  static formatTeacherCredentials(
    teacherName: string,
    credentials: GeneratedCredentials
  ): CredentialDisplay {
    return {
      type: "teacher" as const,
      name: teacherName,
      username: credentials.username,
      password: credentials.password,
      message: `Login credentials for ${teacherName}. First-time login will require password change.`,
    };
  }
}

/**
 * Calculate age from date of birth - standalone function
 */
export const calculateAge = (dob: Date): number => {
  return CredentialGenerator.calculateAge(dob);
};

/**
 * Format credentials for display to admin
 */
export interface CredentialDisplay {
  type: "student" | "parent" | "teacher";
  name: string;
  username: string;
  password: string;
  message: string;
}

export class CredentialFormatter {
  static formatStudentCredentials(
    studentName: string,
    credentials: GeneratedCredentials
  ): CredentialDisplay {
    return {
      type: "student",
      name: studentName,
      username: credentials.username,
      password: credentials.password,
      message: `Login credentials for student ${studentName}. First-time login will require password change.`,
    };
  }

  static formatParentCredentials(
    parentName: string,
    studentName: string,
    credentials: GeneratedCredentials
  ): CredentialDisplay {
    return {
      type: "parent",
      name: parentName,
      username: credentials.username,
      password: credentials.password,
      message: `Login credentials for ${parentName} (parent of ${studentName}). First-time login will require password change.`,
    };
  }

  static formatBothCredentials(
    studentName: string,
    parentName: string,
    studentCredentials: GeneratedCredentials,
    parentCredentials: GeneratedCredentials
  ): {
    student: CredentialDisplay;
    parent: CredentialDisplay;
  } {
    return {
      student: this.formatStudentCredentials(studentName, studentCredentials),
      parent: this.formatParentCredentials(
        parentName,
        studentName,
        parentCredentials
      ),
    };
  }
}
