import createHttpError from 'http-errors';
export function requireAdmin(req, _res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return next(createHttpError(403, 'Admin access required'));
    }
    next();
}
//# sourceMappingURL=requireAdmin.js.map