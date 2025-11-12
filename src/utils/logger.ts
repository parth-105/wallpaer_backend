import morgan from 'morgan';
import { env } from '../config/env.js';

export const requestLogger = morgan(env.nodeEnv === 'development' ? 'dev' : 'combined');

export function logInfo(message: string, meta?: unknown): void {
  if (env.nodeEnv !== 'test') {
    console.log(message, meta ?? '');
  }
}

export function logError(message: string, error?: unknown): void {
  console.error(message, error ?? '');
}

