# Dating App API

A production-ready dating app API built with Hono.js, Bun, MongoDB, and Redis. Features JWT authentication with refresh tokens, user management, and profile matching.

## Features

- JWT Authentication with Access and Refresh Tokens
- Redis-based token blacklisting
- MongoDB with Mongoose for data persistence
- Geospatial queries for location-based matching
- Advanced user search with filters
- Input validation using Zod
- CORS support
- Error handling and logging
- Production-ready code structure

## Prerequisites

- Bun runtime
- MongoDB
- Redis
- Node.js 16+

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/dating_app
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
NODE_ENV=development
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Start the development server:
   ```bash
   bun run dev
   ```

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `POST /api/users/refresh-token` - Refresh access token
- `POST /api/users/logout` - Logout user (requires authentication)

### User Management

- `GET /api/users/profile` - Get user profile (requires authentication)
- `PUT /api/users/profile` - Update user profile (requires authentication)
- `DELETE /api/users/account` - Delete user account (requires authentication)
- `GET /api/users/search` - Search users with filters (requires authentication)

## Request/Response Examples

### Register User

```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "location": {
    "coordinates": [longitude, latitude]
  }
}
```

### Search Users

```http
GET /api/users/search?page=1&limit=10&maxDistance=50&minAge=25&maxAge=35&gender=female
Authorization: Bearer <access_token>
```

## Error Handling

The API uses standard HTTP status codes and returns JSON responses with the following structure:

```json
{
  "message": "Error message",
  "error": "Detailed error (only in development)"
}
```

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Token blacklisting for logout
- Input validation and sanitization
- CORS protection
- Rate limiting (TODO)

## Performance Optimizations

- Redis caching for token blacklist
- MongoDB indexing for faster queries
- Geospatial indexing for location-based searches
- Pagination for search results
- Efficient MongoDB aggregation pipelines

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT 