import { Context } from 'hono';
import { IUser, User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema, updateProfileSchema, refreshTokenSchema } from '../schemas/user.schema';
import bcrypt from 'bcryptjs';
import { Document, Types } from 'mongoose';

type UserDocument = Document<unknown, {}, IUser> & IUser & { _id: Types.ObjectId };

export class UserController {
  // Register new user
  static async register(c: Context) {
    try {
      const body = await c.req.json();
      const validatedData = registerSchema.parse(body);

      // Check if user already exists
      const existingUser = await User.findOne({ email: validatedData.email });
      if (existingUser) {
        return c.json({ message: 'User already exists' }, 400);
      }

      // Create new user
      const user = await User.create({
        ...validatedData,
        location: {
          type: 'Point',
          coordinates: validatedData.location.coordinates
        }
      });

      // Generate tokens
      const { accessToken, refreshToken } = AuthService.generateTokens(user as UserDocument);
      
      // Update user with refresh token
      user.refreshToken = refreshToken;
      await user.save();

      return c.json({
        message: 'User registered successfully',
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        accessToken,
        refreshToken
      }, 201);
    } catch (error) {
      return c.json({ message: error.message }, 400);
    }
  }

  // Login user
  static async login(c: Context) {
    try {
      const body = await c.req.json();
      const validatedData = loginSchema.parse(body);

      // Find user
      const user = await User.findOne({ email: validatedData.email });
      if (!user) {
        return c.json({ message: 'Invalid credentials' }, 401);
      }

      // Check password
      const isValidPassword = await user.comparePassword(validatedData.password);
      if (!isValidPassword) {
        return c.json({ message: 'Invalid credentials' }, 401);
      }

      // Generate tokens
      const { accessToken, refreshToken } = AuthService.generateTokens(user as UserDocument);
      
      // Update refresh token
      user.refreshToken = refreshToken;
      await user.save();

      return c.json({
        message: 'Login successful',
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      return c.json({ message: error.message }, 400);
    }
  }

  // Refresh token
  static async refreshToken(c: Context) {
    try {
      const body = await c.req.json();
      const { refreshToken } = refreshTokenSchema.parse(body);

      // Verify refresh token
      const decoded = await AuthService.verifyRefreshToken(refreshToken);
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || user.refreshToken !== refreshToken) {
        return c.json({ message: 'Invalid refresh token' }, 401);
      }

      // Generate new tokens
      const tokens = AuthService.generateTokens(user as UserDocument);
      
      // Update refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return c.json(tokens);
    } catch (error) {
      return c.json({ message: error.message }, 401);
    }
  }

  // Logout user
  static async logout(c: Context) {
    try {
      const user = c.get('user');
      const token = c.req.header('Authorization')?.split(' ')[1];

      if (token) {
        // Add token to blacklist
        await AuthService.addToBlacklist(token, 900); // 15 minutes
      }

      // Clear refresh token
      user.refreshToken = undefined;
      await user.save();

      return c.json({ message: 'Logged out successfully' });
    } catch (error) {
      return c.json({ message: error.message }, 500);
    }
  }

  // Get user profile
  static async getProfile(c: Context) {
    try {
      const user = c.get('user');
      return c.json(user);
    } catch (error) {
      return c.json({ message: error.message }, 500);
    }
  }

  // Update user profile
  static async updateProfile(c: Context) {
    try {
      const user = c.get('user');
      const body = await c.req.json();
      const validatedData = updateProfileSchema.parse(body);

      // Update user
      Object.assign(user, validatedData);
      
      if (validatedData.location) {
        user.location = {
          type: 'Point',
          coordinates: validatedData.location.coordinates
        };
      }

      await user.save();
      return c.json({ message: 'Profile updated successfully', user });
    } catch (error) {
      return c.json({ message: error.message }, 400);
    }
  }

  // Delete user account
  static async deleteAccount(c: Context) {
    try {
      const user = c.get('user');
      await User.findByIdAndDelete(user._id);
      return c.json({ message: 'Account deleted successfully' });
    } catch (error) {
      return c.json({ message: error.message }, 500);
    }
  }

  // Search users by criteria (with pagination and filters)
  static async searchUsers(c: Context) {
    try {
      const user = c.get('user');
      const { 
        page = 1, 
        limit = 10,
        maxDistance = user.preferences?.distance || 50,
        minAge,
        maxAge,
        gender
      } = c.req.query();

      const query: any = {
        _id: { $ne: user._id }
      };

      // Gender filter
      if (gender) {
        query.gender = gender;
      }

      // Age filter
      if (minAge || maxAge) {
        query.dateOfBirth = {};
        if (minAge) {
          query.dateOfBirth.$lte = new Date(Date.now() - parseInt(minAge) * 365.25 * 24 * 60 * 60 * 1000);
        }
        if (maxAge) {
          query.dateOfBirth.$gte = new Date(Date.now() - parseInt(maxAge) * 365.25 * 24 * 60 * 60 * 1000);
        }
      }

      // Geospatial query
      if (user.location) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: user.location.coordinates
            },
            $maxDistance: parseInt(maxDistance) * 1000 // Convert to meters
          }
        };
      }

      const users = await User.find(query)
        .select('-password -refreshToken')
        .skip((parseInt(page as string) - 1) * parseInt(limit as string))
        .limit(parseInt(limit as string));

      const total = await User.countDocuments(query);

      return c.json({
        users,
        pagination: {
          total,
          page: parseInt(page as string),
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error) {
      return c.json({ message: error.message }, 500);
    }
  }
} 