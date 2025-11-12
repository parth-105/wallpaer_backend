import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    return next(createHttpError(403, 'Admin access required'));
  }
  next();
}
