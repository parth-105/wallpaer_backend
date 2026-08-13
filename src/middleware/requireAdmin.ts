import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  // Always allow OPTIONS preflight requests to pass through CORS handler
  if (req.method === 'OPTIONS') {
    return next();
  }

  if (!req.user) {
    return next(createHttpError(401, 'Authentication required'));
  }
  if (req.user.role !== 'admin') {
    return next(createHttpError(403, 'Admin access required'));
  }
  next();
}
