import { ErrorRequestHandler } from 'express';
import createHttpError from 'http-errors';
import { env } from '../config/env.js';
import { logError } from '../utils/logger.js';

const isProduction = env.nodeEnv === 'production';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Log all errors for debugging
  logError('Request error', {
    message: err.message,
    status: err.status || err.statusCode,
    stack: err.stack,
    name: err.name,
  });

  const httpError = createHttpError(err.status || err.statusCode || 500, err.message || 'Internal Server Error');

  res.status(httpError.statusCode).json({
    success: false,
    message: httpError.message,
    ...(!isProduction ? { 
      stack: err.stack,
      error: err.name,
      details: err.message,
    } : {}),
  });
};
