import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { registerSchema, loginSchema, updateProfileSchema, refreshTokenSchema } from '../schemas/user.schema';
import { z } from 'zod';

const userRouter = new OpenAPIHono();

// Response schemas
const AuthResponse = z.object({
  message: z.string(),
  user: z.object({
    _id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string()
  }).optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional()
});

const ErrorResponse = z.object({
  message: z.string(),
  error: z.string().optional()
});

const ProfileResponse = z.object({
  _id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  bio: z.string().optional(),
  interests: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  location: z.object({
    type: z.string(),
    coordinates: z.array(z.number())
  }),
  preferences: z.object({
    minAge: z.number().optional(),
    maxAge: z.number().optional(),
    distance: z.number().optional(),
    genderPreference: z.array(z.enum(['male', 'female', 'other'])).optional()
  }).optional()
});

const SearchResponse = z.object({
  users: z.array(ProfileResponse),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    pages: z.number()
  })
});

// Register route
const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerSchema
        }
      }
    }
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: AuthResponse
        }
      },
      description: 'User registered successfully'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponse
        }
      },
      description: 'Invalid input'
    }
  },
  tags: ['Auth'],
  description: 'Register a new user'
});

// Login route
const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AuthResponse
        }
      },
      description: 'Login successful'
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponse
        }
      },
      description: 'Invalid credentials'
    }
  },
  tags: ['Auth'],
  description: 'Login user'
});

// Refresh token route
const refreshTokenRoute = createRoute({
  method: 'post',
  path: '/refresh-token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: refreshTokenSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            accessToken: z.string(),
            refreshToken: z.string()
          })
        }
      },
      description: 'Tokens refreshed successfully'
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponse
        }
      },
      description: 'Invalid refresh token'
    }
  },
  tags: ['Auth'],
  description: 'Refresh access token using refresh token'
});

// Get profile route
const getProfileRoute = createRoute({
  method: 'get',
  path: '/profile',
  security: [{ Bearer: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ProfileResponse
        }
      },
      description: 'User profile retrieved successfully'
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponse
        }
      },
      description: 'Unauthorized'
    }
  },
  tags: ['Users'],
  description: 'Get user profile'
});

// Update profile route
const updateProfileRoute = createRoute({
  method: 'put',
  path: '/profile',
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: updateProfileSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ProfileResponse
        }
      },
      description: 'Profile updated successfully'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponse
        }
      },
      description: 'Invalid input'
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponse
        }
      },
      description: 'Unauthorized'
    }
  },
  tags: ['Users'],
  description: 'Update user profile'
});

// Delete account route
const deleteAccountRoute = createRoute({
  method: 'delete',
  path: '/account',
  security: [{ Bearer: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      },
      description: 'Account deleted successfully'
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponse
        }
      },
      description: 'Unauthorized'
    }
  },
  tags: ['Users'],
  description: 'Delete user account'
});

// Logout route
const logoutRoute = createRoute({
  method: 'post',
  path: '/logout',
  security: [{ Bearer: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      },
      description: 'Logged out successfully'
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponse
        }
      },
      description: 'Unauthorized'
    }
  },
  tags: ['Auth'],
  description: 'Logout user'
});

// Search users route
const searchUsersRoute = createRoute({
  method: 'get',
  path: '/search',
  security: [{ Bearer: [] }],
  request: {
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      maxDistance: z.string().optional(),
      minAge: z.string().optional(),
      maxAge: z.string().optional(),
      gender: z.enum(['male', 'female', 'other']).optional()
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SearchResponse
        }
      },
      description: 'Users retrieved successfully'
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponse
        }
      },
      description: 'Unauthorized'
    }
  },
  tags: ['Users'],
  description: 'Search users with filters'
});

// Public routes
userRouter.openapi(registerRoute, UserController.register);
userRouter.openapi(loginRoute, UserController.login);
userRouter.openapi(refreshTokenRoute, UserController.refreshToken);

// Protected routes
userRouter.use('/*', authMiddleware);
userRouter.openapi(getProfileRoute, UserController.getProfile);
userRouter.openapi(updateProfileRoute, UserController.updateProfile);
userRouter.openapi(deleteAccountRoute, UserController.deleteAccount);
userRouter.openapi(logoutRoute, UserController.logout);
userRouter.openapi(searchUsersRoute, UserController.searchUsers);

export default userRouter; 