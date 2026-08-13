import app from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';
import { logInfo } from '../src/utils/logger.js';

// Initialize database connection for serverless
connectDatabase()
  .then(() => {
    logInfo('Database connection initialized in serverless function');
  })
  .catch(() => {
    logInfo('Database connection will be established on first request');
  });

// Serverless function entrypoint wrapper
export default function handler(req: any, res: any) {
  const origin = req.headers.origin || 'https://wallpaer-admin-frontend.vercel.app';

  // Always attach CORS headers at Vercel serverless entrypoint
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-API-Key');

  // Immediately respond HTTP 204 OK for all CORS OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Delegate all GET/POST/PUT/DELETE requests to Express app
  return app(req, res);
}
