import { ErrorRequestHandler } from 'express';
import createHttpError from 'http-errors';
import { env } from '../config/env.js';
import { logError } from '../utils/logger.js';

const isProduction = env.nodeEnv === 'production';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const httpError = createHttpError(err.status || 500, err.message || 'Internal Server Error');

  if (!isProduction) {
    logError('Request error', err);
  }

  res.status(httpError.statusCode).json({
    success: false,
    message: httpError.message,
    ...(isProduction ? null : { stack: err.stack }),
  });
};
