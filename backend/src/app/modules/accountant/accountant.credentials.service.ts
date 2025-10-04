import { Types } from 'mongoose';
import { User } from '../user/user.model';
import { Accountant } from './accountant.model';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';

interface AccountantCredentials {
  accountantId: string;
  username: string;
  password: string;
  temporaryPassword: boolean;
}

interface CredentialsResponse {
  credentials: AccountantCredentials;
  message: string;
}

export class AccountantCredentialsService {
  /**
   * Generate auto credentials for accountant
   */
  static async generateAccountantCredentials(
    accountantId: string,
    firstName: string,
    lastName: string
  ): Promise<AccountantCredentials> {
    // Generate username from accountantId (remove hyphens and make lowercase)
    const username = accountantId.replace(/-/g, '').toLowerCase();
    
    // Use accountantId as temporary password
    const password = accountantId;
    
    return {
      accountantId,
      username,
      password,
      temporaryPassword: true
    };
  }

  /**
   * Save accountant credentials to storage
   */
  static async saveAccountantCredentials(
    schoolId: string,
    credentials: AccountantCredentials
  ): Promise<void> {
    try {
      await User.findOneAndUpdate(
        { username: credentials.username },
        { 
          $set: { 
            passwordChangeRequired: true,
            credentialsGenerated: true,
            credentialsGeneratedAt: new Date()
          }
        }
      );
    } catch (error) {
      console.error('Failed to save accountant credentials:', error);
    }
  }

  /**
   * Get saved credentials for an accountant
   */
  static async getAccountantCredentials(accountantId: string): Promise<CredentialsResponse | null> {
    try {
      const accountant = await Accountant.findOne({ accountantId })
        .populate('userId', 'username firstName lastName credentialsGenerated passwordChangeRequired');

      if (!accountant || !accountant.userId) {
        return null;
      }

      const user = accountant.userId as any;
      
      return {
        credentials: {
          accountantId,
          username: user.username,
          password: accountantId,
          temporaryPassword: user.passwordChangeRequired !== false
        },
        message: user.credentialsGenerated 
          ? 'These are auto-generated credentials. Accountant should change password on first login.'
          : 'Default credentials based on Accountant ID. Password may have been changed.'
      };
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve accountant credentials'
      );
    }
  }

  /**
   * Reset accountant password to default
   */
  static async resetAccountantPassword(accountantId: string): Promise<CredentialsResponse> {
    try {
      const accountant = await Accountant.findOne({ accountantId })
        .populate('userId', 'username');

      if (!accountant || !accountant.userId) {
        throw new AppError(httpStatus.NOT_FOUND, 'Accountant not found');
      }

      await User.findByIdAndUpdate(accountant.userId, {
        $set: {
          passwordHash: accountantId,
          passwordChangeRequired: true,
          passwordResetAt: new Date()
        }
      });

      const user = accountant.userId as any;

      return {
        credentials: {
          accountantId,
          username: user.username,
          password: accountantId,
          temporaryPassword: true
        },
        message: 'Password has been reset to Accountant ID. Should change password on first login.'
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to reset accountant password'
      );
    }
  }

  /**
   * Get all accountants credentials for a school
   */
  static async getSchoolAccountantsCredentials(schoolId: string): Promise<AccountantCredentials[]> {
    try {
      const accountants = await Accountant.find({ schoolId })
        .populate('userId', 'username firstName lastName credentialsGenerated')
        .select('accountantId userId');

      return accountants
        .filter(accountant => accountant.userId && (accountant.userId as any).credentialsGenerated)
        .map(accountant => {
          const user = accountant.userId as any;
          return {
            accountantId: accountant.accountantId,
            username: user.username,
            password: accountant.accountantId,
            temporaryPassword: true
          };
        });
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve school accountants credentials'
      );
    }
  }
}
