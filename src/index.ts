
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { connectDB } from './config/database';
import userRouter from './routes/user.routes';

// Create OpenAPI instance for documentation
const app = new OpenAPIHono();

// Middleware
app.use('*', cors());
app.use('*', logger());
app.use('*', prettyJSON());

// Swagger Documentation
app.doc('/api-doc', {
  openapi: '3.0.0',
  info: {
    title: 'Dating App API',
    version: '1.0.0',
    description: 'A dating app API with authentication and user management',
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User management endpoints' },
  ],
});

// Swagger UI
app.get('/swagger', swaggerUI({ url: '/api-doc' }));

// Connect to MongoDB
connectDB().catch(console.error);

// Routes
app.route('/api/users', userRouter);

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: 'Dating App API is running' }));

// Error handling
app.onError((err, c) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);
  return c.json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  }, 500);
});

// Not found handler
app.notFound((c) => {
  return c.json({
    message: 'Not Found',
    status: 404
  }, 404);
});

export default {
  port: 4000,
  fetch: app.fetch
}; 