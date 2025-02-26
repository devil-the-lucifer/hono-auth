import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  dateOfBirth: z.string().transform((str) => new Date(str)),
  gender: z.enum(['male', 'female', 'other']),
  bio: z.string().max(500).optional(),
  interests: z.array(z.string()).optional(),
  location: z.object({
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90)    // latitude
    ])
  }),
  preferences: z.object({
    minAge: z.number().min(18).max(100).optional(),
    maxAge: z.number().min(18).max(100).optional(),
    distance: z.number().min(1).max(1000).optional(),
    genderPreference: z.array(z.enum(['male', 'female', 'other'])).optional()
  }).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  interests: z.array(z.string()).optional(),
  photos: z.array(z.string().url()).optional(),
  location: z.object({
    coordinates: z.tuple([
      z.number().min(-180).max(180),
      z.number().min(-90).max(90)
    ])
  }).optional(),
  preferences: z.object({
    minAge: z.number().min(18).max(100).optional(),
    maxAge: z.number().min(18).max(100).optional(),
    distance: z.number().min(1).max(1000).optional(),
    genderPreference: z.array(z.enum(['male', 'female', 'other'])).optional()
  }).optional()
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string()
}); 