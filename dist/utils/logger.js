import morgan from 'morgan';
import { env } from '../config/env.js';
export const requestLogger = morgan(env.nodeEnv === 'development' ? 'dev' : 'combined');
export function logInfo(message, meta) {
    if (env.nodeEnv !== 'test') {
        console.log(message, meta ?? '');
    }
}
export function logError(message, error) {
    console.error(message, error ?? '');
}
//# sourceMappingURL=logger.js.map