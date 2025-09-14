import jwt from 'jsonwebtoken';
import config from '../config';
import { IUserDocument } from '../modules/user/user.interface';

export interface JWTPayload {
  id: string;
  username: string;
  role: string;
  schoolId: string;
  iat?: number;
  exp?: number;
}

export const generateAccessToken = (user: IUserDocument): string => {
  const payload: JWTPayload = {
    id: user._id.toString(),
    username: user.username,
    role: user.role,
    schoolId: user.schoolId?.toString() || 'system',
  };

  return jwt.sign(payload, config.jwt_secret, {
    expiresIn: config.jwt_expires_in,
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt_secret) as JWTPayload;
};

export const getTokenExpiration = (): Date => {
  // Parse expires_in (e.g., "8h", "24h", "7d")
  const expiresIn = config.jwt_expires_in;
  const now = new Date();

  if (expiresIn.endsWith('h')) {
    const hours = parseInt(expiresIn.slice(0, -1));
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  } else if (expiresIn.endsWith('d')) {
    const days = parseInt(expiresIn.slice(0, -1));
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  } else if (expiresIn.endsWith('m')) {
    const minutes = parseInt(expiresIn.slice(0, -1));
    return new Date(now.getTime() + minutes * 60 * 1000);
  } else {
    // Default to 8 hours if format is not recognized
    return new Date(now.getTime() + 8 * 60 * 60 * 1000);
  }
};