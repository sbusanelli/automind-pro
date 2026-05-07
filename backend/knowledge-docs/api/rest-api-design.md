# REST API Design for AutoMind

## Overview
This guide covers REST API design principles and best practices for AutoMind's autonomous AI operations system.

## API Design Principles

### Resource-Oriented Design
Design APIs around resources, not actions:

```typescript
// Good: Resource-oriented
GET /api/jobs
POST /api/jobs
GET /api/jobs/{id}
PUT /api/jobs/{id}
DELETE /api/jobs/{id}

// Bad: Action-oriented
POST /api/createJob
POST /api/updateJob/{id}
POST /api/deleteJob/{id}
```

### HTTP Methods
Use appropriate HTTP methods for operations:

- **GET**: Retrieve resources
- **POST**: Create new resources
- **PUT**: Update entire resources
- **PATCH**: Partial updates
- **DELETE**: Remove resources

### URL Structure
Follow consistent URL patterns:

```typescript
// Base URL
https://api.automind.ai/v1

// Resource endpoints
/api/v1/jobs
/api/v1/conversations
/api/v1/knowledge
/api/v1/users

// Nested resources
/api/v1/jobs/{jobId}/executions
/api/v1/users/{userId}/conversations
/api/v1/knowledge/{knowledgeId}/chunks
```

## Request/Response Format

### Request Headers
Standard headers for AutoMind API:

```typescript
// Content types
Content-Type: application/json
Content-Type: multipart/form-data

// Authentication
Authorization: Bearer <jwt-token>
X-API-Key: <api-key>

// Rate limiting
X-Rate-Limit-Limit: 1000
X-Rate-Limit-Remaining: 999
X-Rate-Limit-Reset: 1640995200
```

### Response Format
Consistent response structure:

```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Success response
{
  "data": { "id": "job-123", "name": "Data Processing" },
  "success": true,
  "metadata": {
    "timestamp": "2026-05-07T17:00:00.000Z",
    "requestId": "req-abc123",
    "version": "v1"
  }
}

// Error response
{
  "data": null,
  "success": false,
  "message": "Validation failed",
  "errors": ["Name is required", "Invalid schedule format"],
  "metadata": {
    "timestamp": "2026-05-07T17:00:00.000Z",
    "requestId": "req-abc123",
    "version": "v1"
  }
}
```

## Pagination

### Cursor-based Pagination
Use cursor-based pagination for large datasets:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor?: string;
    nextCursor?: string;
    hasMore: boolean;
    limit: number;
    total?: number;
  };
}

// Request
GET /api/v1/jobs?limit=50&cursor=abc123

// Response
{
  "data": [...],
  "pagination": {
    "cursor": "abc123",
    "nextCursor": "def456",
    "hasMore": true,
    "limit": 50,
    "total": 1000
  }
}
```

### Offset Pagination
Use offset pagination for smaller datasets:

```typescript
// Request
GET /api/v1/jobs?page=2&limit=20

// Response
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## Filtering and Sorting

### Filtering
Implement flexible filtering:

```typescript
// Query parameters
GET /api/v1/jobs?status=active&priority=high&category=automation

// Complex filtering
GET /api/v1/jobs?filter[status]=active&filter[priority][gte]=medium&filter[created_at][gte]=2026-05-01

// Filter interface
interface FilterOptions {
  status?: string[];
  priority?: string[];
  category?: string;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}
```

### Sorting
Allow sorting on multiple fields:

```typescript
// Single field sorting
GET /api/v1/jobs?sort=created_at

// Multi-field sorting
GET /api/v1/jobs?sort=created_at,-priority,name

// Sort interface
interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}[]
```

## Versioning

### URL Versioning
Use URL path versioning:

```typescript
// Version 1
/api/v1/jobs

// Version 2 (with breaking changes)
/api/v2/jobs

// Maintain backward compatibility
/api/v1/jobs  // Deprecated but supported
/api/v2/jobs  // Current version
```

### Header Versioning
Alternative header-based versioning:

```typescript
// Request
GET /api/jobs
Accept: application/vnd.automind.v2+json

// Response
Content-Type: application/vnd.automind.v2+json
```

## Error Handling

### HTTP Status Codes
Use appropriate HTTP status codes:

```typescript
// Success codes
200 OK              - Request successful
201 Created         - Resource created
202 Accepted        - Request accepted for processing
204 No Content      - Request successful, no content

// Client errors
400 Bad Request     - Invalid request
401 Unauthorized    - Authentication required
403 Forbidden       - Insufficient permissions
404 Not Found       - Resource not found
409 Conflict        - Resource conflict
422 Unprocessable Entity - Validation failed
429 Too Many Requests - Rate limit exceeded

// Server errors
500 Internal Server Error - Server error
502 Bad Gateway      - Upstream service error
503 Service Unavailable - Service temporarily unavailable
```

### Error Response Format
Detailed error information:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
  };
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
  };
  timestamp: string;
  requestId: string;
}

// Example
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "schedule",
      "issue": "Invalid cron expression"
    },
    "field": "schedule"
  },
  "request": {
    "method": "POST",
    "url": "/api/v1/jobs",
    "headers": { ... }
  },
  "timestamp": "2026-05-07T17:00:00.000Z",
  "requestId": "req-abc123"
}
```

## Security

### Authentication
Multiple authentication methods:

```typescript
// JWT Bearer token
Authorization: Bearer <jwt-token>

// API Key
X-API-Key: <api-key>

// OAuth 2.0
Authorization: Bearer <oauth-token>

// Basic Auth (for internal services)
Authorization: Basic <base64-credentials>
```

### Rate Limiting
Implement rate limiting:

```typescript
interface RateLimitConfig {
  windowMs: number;        // 15 minutes
  maxRequests: number;    // 1000 requests
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

// Rate limit headers
X-Rate-Limit-Limit: 1000
X-Rate-Limit-Remaining: 999
X-Rate-Limit-Reset: 1640995200
```

### CORS
Configure CORS for web clients:

```typescript
const corsConfig = {
  origin: ['https://automind.ai', 'https://app.automind.ai'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
```

## Documentation

### OpenAPI Specification
Use OpenAPI 3.0 for API documentation:

```yaml
openapi: 3.0.0
info:
  title: AutoMind API
  version: 1.0.0
  description: AutoMind autonomous AI operations API

paths:
  /api/v1/jobs:
    get:
      summary: List jobs
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [active, paused, completed, failed]
      responses:
        200:
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Job'
```

### Interactive Documentation
Provide interactive API documentation:

```typescript
// Swagger UI endpoint
GET /api/docs

// OpenAPI JSON
GET /api/docs/openapi.json

// Postman collection
GET /api/docs/postman
```

## Performance

### Response Compression
Enable response compression:

```typescript
const compressionConfig = {
  level: 6,
  threshold: 1024, // Only compress responses > 1KB
  types: ['text/*', 'application/json', 'application/xml']
};
```

### Caching
Implement caching strategies:

```typescript
// Cache control headers
Cache-Control: public, max-age=3600
ETag: "abc123"
Last-Modified: Wed, 07 May 2026 17:00:00 GMT

// Conditional requests
If-None-Match: "abc123"
If-Modified-Since: Wed, 07 May 2026 17:00:00 GMT
```

### Request Validation
Validate requests efficiently:

```typescript
// Request validation schema
const jobSchema = {
  type: 'object',
  required: ['name', 'schedule'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', maxLength: 1000 },
    schedule: { type: 'string', pattern: '^\\d{1,2} \\d{1,2} \\* \\* \\*$' },
    priority: { enum: ['low', 'medium', 'high', 'critical'] }
  }
};
```

## Monitoring

### API Metrics
Track API performance metrics:

```typescript
interface APIMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
}

// Metrics collection
const metrics = {
  'api.requests.total': 0,
  'api.requests.success': 0,
  'api.requests.error': 0,
  'api.response_time.avg': 0,
  'api.response_time.p95': 0,
  'api.response_time.p99': 0
};
```

### Health Endpoints
Implement health check endpoints:

```typescript
// Basic health check
GET /api/health

// Detailed health check
GET /api/health/detailed

// Health check response
{
  "status": "healthy",
  "timestamp": "2026-05-07T17:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "pinecone": "healthy"
  },
  "metrics": {
    "uptime": 86400,
    "memory_usage": 0.65,
    "cpu_usage": 0.23
  }
}
```

This REST API design guide ensures AutoMind's APIs are consistent, secure, and performant for production use.
