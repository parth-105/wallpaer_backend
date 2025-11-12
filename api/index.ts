import app from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';
import { logInfo } from '../src/utils/logger.js';

// Initialize database connection for serverless
// The connection will be cached in database.ts across invocations
// This ensures connection is ready on cold starts, improving response time
connectDatabase()
  .then(() => {
    logInfo('Database connection initialized in serverless function');
  })
  .catch(() => {
    // Connection will be retried on actual request if initialization fails
    logInfo('Database connection will be established on first request');
  });

// Export the Express app as a serverless function
// Vercel will handle routing all requests to this app
export default app;

