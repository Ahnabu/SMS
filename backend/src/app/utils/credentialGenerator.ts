import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Student } from "../modules/student/student.model";
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
   * Format: YYYYGGRRR (e.g., 2025050001)
   */
  static async generateUniqueStudentId(
    admissionYear: number,
    grade: string,
    schoolId: string
  ): Promise<{ studentId: string; rollNumber: number }> {
    // Convert grade to 2-digit number (pad with zero if needed)
    const gradeNumber = grade.toString().padStart(2, "0");

    // Find the highest roll number for this year, grade, and school
    const existingStudents = await Student.find({
      schoolId,
      admissionYear,
      grade,
      isActive: true,
    })
      .sort({ rollNumber: -1 })
      .limit(1);

    let nextRoll = 1;
    if (existingStudents.length > 0 && existingStudents[0].rollNumber) {
      nextRoll = existingStudents[0].rollNumber + 1;
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
  type: "student" | "parent";
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
