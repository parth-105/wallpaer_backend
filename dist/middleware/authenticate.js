import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { env } from '../config/env.js';
export function authenticateJwt(req, _res, next) {
    // Verify JWT secret is configured
    if (!env.jwtSecret) {
        return next(createHttpError(500, 'JWT secret is not configured'));
    }
    const authorization = req.headers.authorization;
    if (!authorization) {
        return next(createHttpError(401, 'Authorization header missing'));
    }
    const token = authorization.replace('Bearer ', '').trim();
    if (!token) {
        return next(createHttpError(401, 'Token is missing'));
    }
    try {
        const payload = jwt.verify(token, env.jwtSecret);
        // Validate payload structure
        if (!payload.sub || !payload.email || !payload.role) {
            return next(createHttpError(401, 'Invalid token payload'));
        }
        req.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(createHttpError(401, 'Invalid token'));
        }
        if (error instanceof jwt.TokenExpiredError) {
            return next(createHttpError(401, 'Token expired'));
        }
        next(createHttpError(401, 'Invalid or expired token'));
    }
}
//# sourceMappingURL=authenticate.js.map