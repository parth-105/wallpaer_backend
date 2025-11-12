import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { env } from '../config/env.js';

interface JwtPayload {
  sub: string;
  email: string;
  role: 'admin';
  iat: number;
  exp: number;
}

export function authenticateJwt(req: Request, _res: Response, next: NextFunction): void {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return next(createHttpError(401, 'Authorization header missing'));
  }

  const token = authorization.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (error) {
    next(createHttpError(401, 'Invalid or expired token'));
  }
}
