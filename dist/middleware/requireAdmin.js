import createHttpError from 'http-errors';
export function requireAdmin(req, _res, next) {
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
//# sourceMappingURL=requireAdmin.js.map