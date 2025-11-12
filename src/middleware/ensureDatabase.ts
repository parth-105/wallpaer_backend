import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { logError, logInfo } from '../utils/logger.js';

/**
 * Middleware to ensure database connection is established before handling the request
 * This is especially important for serverless environments where connections might be cold
 */
export async function ensureDatabase(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return next();
    }

    // Try to connect
    logInfo('Database not connected, attempting connection...');
    await connectDatabase();
    logInfo('Database connected successfully');
    next();
  } catch (error) {
    logError('Database connection failed in middleware', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined,
    });
  }
}

