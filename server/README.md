# Foundling Server

A high-performance, scalable server built with Bun and LMDB for authentication and data management.

## Features

- **Fast Authentication**: JWT-based authentication with secure session management
- **Scalable Database**: LMDB with proper indexing and transaction support
- **High Performance**: MessagePack encoding, compression, and caching
- **RESTful API**: Clean endpoints for user management and data operations
- **Session Management**: Automatic cleanup and expiration handling

## Quick Start

```bash
# Install dependencies
bun install

# Start the server
bun run index.ts

# Server runs on http://localhost:3003
```

## API Endpoints

### Health Check

**GET** `/health`

Check server status and uptime.

```bash
curl -X GET http://localhost:3003/health
```

**Expected Output:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-12T03:16:41.044Z",
  "uptime": 7.1830637500000005
}
```

---

### Authentication

#### Signup

**POST** `/auth`

Create a new user account.

```bash
curl -X POST http://localhost:3003/auth \
  -H "Content-Type: application/json" \
  -d '{
    "type": "signup",
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "userId": "user_1754968605684_ujkgvjer8"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

#### Login

**POST** `/auth`

Authenticate user and receive JWT token.

```bash
curl -X POST http://localhost:3003/auth \
  -H "Content-Type: application/json" \
  -d '{
    "type": "login",
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "userId": "user_1754968605684_ujkgvjer8",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

#### Logout

**POST** `/auth`

Invalidate user session.

```bash
curl -X POST http://localhost:3003/auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "logout"
  }'
```

**Expected Output:**
```json
{
  "success": true
}
```

#### Delete User

**POST** `/auth`

Delete user account and all associated data.

```bash
curl -X POST http://localhost:3003/auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "delete"
  }'
```

**Expected Output:**
```json
{
  "success": true
}
```

#### OTP Generation

**POST** `/auth`

Generate one-time password for email verification.

```bash
curl -X POST http://localhost:3003/auth \
  -H "Content-Type: application/json" \
  -d '{
    "type": "otp",
    "email": "user@example.com",
    "action": "generate"
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "code": "314110"
}
```

#### OTP Verification

**POST** `/auth`

Verify one-time password.

```bash
curl -X POST http://localhost:3003/auth \
  -H "Content-Type: application/json" \
  -d '{
    "type": "otp",
    "email": "user@example.com",
    "action": "verify",
    "code": "314110"
  }'
```

**Expected Output:**
```json
{
  "success": true
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid OTP code"
}
```

---

### Database Operations

All database operations require authentication via the `Authorization: Bearer <token>` header.

#### Get User by ID

**POST** `/db`

Retrieve user information by user ID.

```bash
curl -X POST http://localhost:3003/db \
  -H "Content-Type: application/json" \
  -d '{
    "type": "getUserById",
    "userId": "user_1754968605684_ujkgvjer8"
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "user": {
    "id": "user_1754968605684_ujkgvjer8",
    "email": "user@example.com",
    "passwordHash": "b55c8792d1ce458e279308835f8a97b580263503e76e1998e279703e35ad0c2e",
    "createdAt": "2025-08-12T03:16:45.684Z",
    "updatedAt": "2025-08-12T03:16:45.684Z"
  }
}
```

#### Get User by Email

**POST** `/db`

Retrieve user information by email address.

```bash
curl -X POST http://localhost:3003/db \
  -H "Content-Type: application/json" \
  -d '{
    "type": "getUserByEmail",
    "email": "user@example.com"
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "user": {
    "id": "user_1754968605684_ujkgvjer8",
    "email": "user@example.com",
    "passwordHash": "b55c8792d1ce458e279308835f8a97b580263503e76e1998e279703e35ad0c2e",
    "createdAt": "2025-08-12T03:16:45.684Z",
    "updatedAt": "2025-08-12T03:16:45.684Z"
  }
}
```

#### Update User

**POST** `/db`

Update user information (requires authentication).

```bash
curl -X POST http://localhost:3003/db \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "updateUser",
    "updates": {
      "email": "newemail@example.com"
    }
  }'
```

**Expected Output:**
```json
{
  "success": true
}
```

#### Create Data Record

**POST** `/db`

Create a new data record (requires authentication).

```bash
curl -X POST http://localhost:3003/db \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "createDataRecord",
    "key": "user_preference",
    "value": {
      "theme": "dark",
      "language": "en"
    }
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "recordId": "data_1754968637687_zbl8oniju"
}
```

#### Get Data Record

**POST** `/db`

Retrieve a specific data record by ID.

```bash
curl -X POST http://localhost:3003/db \
  -H "Content-Type: application/json" \
  -d '{
    "type": "getDataRecord",
    "recordId": "data_1754968637687_zbl8oniju"
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "record": {
    "id": "data_1754968637687_zbl8oniju",
    "userId": "user_1754968605684_ujkgvjer8",
    "key": "user_preference",
    "value": {
      "theme": "dark",
      "language": "en"
    },
    "createdAt": "2025-08-12T03:17:17.687Z",
    "updatedAt": "2025-08-12T03:17:17.687Z"
  }
}
```

#### Get Data Records by User

**POST** `/db`

Retrieve all data records for the authenticated user.

```bash
curl -X POST http://localhost:3003/db \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "getDataRecordsByUser"
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "records": [
    {
      "id": "data_1754968637687_zbl8oniju",
      "userId": "user_1754968605684_ujkgvjer8",
      "key": "user_preference",
      "value": {
        "theme": "dark",
        "language": "en"
      },
      "createdAt": "2025-08-12T03:17:17.687Z",
      "updatedAt": "2025-08-12T03:17:17.687Z"
    }
  ]
}
```

#### Update Data Record

**POST** `/db`

Update a data record (requires authentication and ownership).

```bash
curl -X POST http://localhost:3003/db \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "updateDataRecord",
    "recordId": "data_1754968637687_zbl8oniju",
    "updates": {
      "value": {
        "theme": "light",
        "language": "en"
      }
    }
  }'
```

**Expected Output:**
```json
{
  "success": true
}
```

#### Delete Data Record

**POST** `/db`

Delete a data record (requires authentication and ownership).

```bash
curl -X POST http://localhost:3003/db \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "deleteDataRecord",
    "recordId": "data_1754968637687_zbl8oniju"
  }'
```

**Expected Output:**
```json
{
  "success": true
}
```

#### Get Database Statistics

**POST** `/db`

Get database statistics (no authentication required).

```bash
curl -X POST http://localhost:3003/db \
  -H "Content-Type: application/json" \
  -d '{
    "type": "getDBStats"
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "stats": {
    "users": 13,
    "sessions": 1,
    "data": 1
  }
}
```

#### Cleanup Expired Sessions

**POST** `/db`

Clean up expired sessions (no authentication required).

```bash
curl -X POST http://localhost:3003/db \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cleanupExpiredSessions"
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Expired sessions cleaned up"
}
```

---

### Error Responses

All endpoints return consistent error responses:

#### Method Not Allowed
```json
{
  "success": false,
  "error": "Method not allowed"
}
```

#### Authentication Required
```json
{
  "success": false,
  "error": "Authentication required"
}
```

#### Invalid Request
```json
{
  "success": false,
  "error": "Invalid request body"
}
```

#### Endpoint Not Found
```json
{
  "success": false,
  "error": "Endpoint not found"
}
```

#### Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### Authentication Flow

1. **Signup**: Create account → receive userId
2. **Login**: Authenticate → receive JWT token
3. **Use Token**: Include `Authorization: Bearer <token>` header for protected endpoints
4. **Logout**: Invalidate token → token becomes unusable

### JWT Token Format

Tokens are valid for 24 hours and contain:
- `userId`: User identifier
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

### Database Architecture

- **Users Database**: User account information
- **Sessions Database**: Active user sessions
- **Data Database**: User data records
- **Email Index**: Fast email-to-user lookups using LMDB's dupSort

### Performance Features

- **MessagePack Encoding**: Fast serialization/deserialization
- **Compression**: LZ4 compression for large data
- **Caching**: LRU caching for frequently accessed data
- **Indexing**: Optimized email lookups
- **Transactions**: Atomic operations for data consistency

### Security Features

- **Password Hashing**: SHA-256 with salt
- **JWT Tokens**: Secure session management
- **Session Expiration**: Automatic cleanup of expired sessions
- **Access Control**: User data isolation and ownership verification
