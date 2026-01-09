# Database Logging Implementation

## Overview

The application now includes **MongoDB-based logging** in addition to file-based logging. System errors and warnings are automatically stored in the database for easy querying and analysis.

## Features

### Multi-Transport Logging

The logger now outputs to **three destinations**:

1. **Console/Terminal** ✅ - Real-time log viewing during development
2. **Log Files** ✅ - Daily rotating files (debug and error logs)
3. **MongoDB Database** ✅ - Persistent storage for warnings and errors

### What Gets Logged to Database?

Only **warnings** and **errors** are stored in MongoDB to avoid performance issues:
- `logger.error()` → Database + File + Console
- `logger.warn()` → Database + File + Console
- `logger.info()` → File + Console only
- `logger.debug()` → File + Console only

## Database Schema

### SystemLog Collection

```typescript
{
  level: string;          // 'error', 'warn', 'info', etc.
  message: string;        // Log message
  metadata?: {            // Additional context
    stack?: string;       // Stack trace for errors
    error?: any;          // Error object
    context?: string;     // Additional context
  };
  timestamp: Date;        // When the log occurred
  createdAt: Date;        // MongoDB creation timestamp
}
```

### Indexes

- `{ level: 1, timestamp: -1 }` - Filter by level and sort by time
- `{ timestamp: -1 }` - Time-based queries
- Optional TTL index for automatic cleanup (commented out by default)

## Usage Examples

### Basic Error Logging

```typescript
import { logger } from './utils/logger';

// Simple error
logger.error('Database connection failed');

// Error with metadata
logger.error('User not found', { userId: '12345', action: 'login' });

// Error with stack trace (automatically captured)
try {
  throw new Error('Something went wrong');
} catch (error) {
  logger.error('Operation failed', { error });
}
```

### Warning Logging

```typescript
// Simple warning
logger.warn('API rate limit approaching');

// Warning with context
logger.warn('Deprecated endpoint used', {
  endpoint: '/api/v1/old',
  clientIp: req.ip,
});
```

### Current Usage in Codebase

The error middleware already logs to the database automatically:

```typescript
// src/middlewares/error.middleware.ts
logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
```

All errors will now be:
- ✅ Printed to terminal
- ✅ Saved to error log file
- ✅ Stored in MongoDB SystemLog collection

## Querying Logs from Database

### Using MongoDB Shell

```javascript
// Get all errors from today
db.systemlogs.find({
  level: 'error',
  timestamp: { $gte: new Date(new Date().setHours(0,0,0,0)) }
}).sort({ timestamp: -1 });

// Get specific error messages
db.systemlogs.find({
  message: /database/i
}).limit(10);

// Count errors by level
db.systemlogs.aggregate([
  { $group: { _id: '$level', count: { $sum: 1 } } }
]);
```

### Using Mongoose (Create a Service)

You can create a service to query logs programmatically:

```typescript
import { SystemLogModel } from './database/schemas/SystemLog.schema';

// Get recent errors
const recentErrors = await SystemLogModel
  .find({ level: 'error' })
  .sort({ timestamp: -1 })
  .limit(100);

// Get errors with specific message
const dbErrors = await SystemLogModel.find({
  message: /database/i,
  level: 'error',
});
```

## Performance Considerations

### Why Only Warn and Error?

Logging all levels (debug, info, http) to the database would generate thousands of database writes per minute, which:
- Slows down application performance
- Fills up database storage quickly
- Increases database costs

### Best Practices

1. **Error handling still works during DB outage**: If MongoDB is down, the logger won't crash—it will just emit an error event and log to console
2. **Async logging**: Database writes are asynchronous and don't block application
3. **Automatic retry**: If a log write fails, Winston will retry automatically

## Log Retention

### Automatic Cleanup (Optional)

Uncomment this line in `SystemLog.schema.ts` to enable automatic deletion of logs older than 90 days:

```typescript
SystemLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
```

You can adjust the retention period:
- 30 days: `2592000` seconds
- 60 days: `5184000` seconds
- 90 days: `7776000` seconds
- 180 days: `15552000` seconds

## Files Created

1. **`src/database/schemas/SystemLog.schema.ts`** - Mongoose schema for system logs
2. **`src/utils/MongoDBTransport.ts`** - Custom Winston transport for MongoDB
3. **`src/utils/logger.ts`** - Updated to include MongoDB transport

## Configuration

### Change Log Level

Edit `src/utils/logger.ts` to change what gets logged to database:

```typescript
// Log everything (not recommended for production)
new MongoDBTransport({
  level: 'info',
  handleExceptions: true,
}),

// Only errors (more restrictive)
new MongoDBTransport({
  level: 'error',
  handleExceptions: true,
}),

// Current setting: warnings and errors
new MongoDBTransport({
  level: 'warn',
  handleExceptions: true,
}),
```

## Troubleshooting

### Logs Not Appearing in Database

1. **Check MongoDB connection**: Ensure database is connected
2. **Check log level**: Only `warn` and `error` are logged by default
3. **Check console for errors**: MongoDB transport will log to console if it fails
4. **Verify schema export**: Ensure `SystemLog.schema.ts` is exported in `src/database/schemas/index.ts`

### Performance Issues

If logging is slowing down your application:
1. Change transport level to `error` only
2. Reduce metadata size
3. Enable TTL index for automatic cleanup
4. Consider using a separate database for logs

## Next Steps

Consider adding:
1. **Admin dashboard** to view logs in UI
2. **Alert system** for critical errors
3. **Log aggregation** for analytics
4. **Export functionality** to download logs

