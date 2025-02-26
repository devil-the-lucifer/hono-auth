import jwt, { JwtPayload } from 'jsonwebtoken';
import { redisClient } from '../config/database';
import { IUser } from '../models/user.model';
import { Document, Types } from 'mongoose';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

type UserDocument = Document<unknown, {}, IUser> & IUser & { _id: Types.ObjectId };

interface JWTAccessPayload extends JwtPayload {
  userId: string;
  email: string;
}

interface JWTRefreshPayload extends JwtPayload {
  userId: string;
}

export class AuthService {
  static generateTokens(user: UserDocument) {
    const accessToken = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email
      } as JWTAccessPayload,
      JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id.toString() } as JWTRefreshPayload,
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  static async verifyAccessToken(token: string): Promise<JWTAccessPayload> {
    try {
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JWTAccessPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  static async verifyRefreshToken(token: string): Promise<JWTRefreshPayload> {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTRefreshPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async addToBlacklist(token: string, expiresIn: number): Promise<void> {
    await redisClient.set(`bl_${token}`, 'true', {
      EX: expiresIn
    });
  }

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await redisClient.get(`bl_${token}`);
    return result === 'true';
  }
} 