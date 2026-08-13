import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  // Always allow OPTIONS preflight requests to pass through CORS handler
  if (req.method === 'OPTIONS') {
    return next();
  }

  const apiKey = req.header('X-API-Key');

  if (!apiKey || apiKey !== env.apiKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid API Key',
    });
  }

  next();
};
