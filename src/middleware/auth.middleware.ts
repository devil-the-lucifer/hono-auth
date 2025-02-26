import { Context } from 'hono';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

export async function authMiddleware(c: Context, next: Function) {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ message: 'Unauthorized - No token provided' }, 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Check if token is blacklisted
    if (await AuthService.isTokenBlacklisted(token)) {
      return c.json({ message: 'Unauthorized - Token is invalid' }, 401);
    }

    // Verify token
    const decoded = await AuthService.verifyAccessToken(token);
    
    // Get user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return c.json({ message: 'Unauthorized - User not found' }, 401);
    }

    // Add user to context
    c.set('user', user);
    
    await next();
  } catch (error) {
    return c.json({ message: 'Unauthorized - Invalid token' }, 401);
  }
} 