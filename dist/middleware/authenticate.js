import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { env } from '../config/env.js';
export function authenticateJwt(req, _res, next) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return next(createHttpError(401, 'Authorization header missing'));
    }
    const token = authorization.replace('Bearer ', '');
    try {
        const payload = jwt.verify(token, env.jwtSecret);
        req.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch (error) {
        next(createHttpError(401, 'Invalid or expired token'));
    }
}
//# sourceMappingURL=authenticate.js.map