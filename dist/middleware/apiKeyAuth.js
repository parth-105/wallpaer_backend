import { env } from '../config/env.js';
export const apiKeyAuth = (req, res, next) => {
    // Always allow OPTIONS preflight requests to pass through CORS handler
    if (req.method === 'OPTIONS') {
        return next();
    }
    // 1. Allow if valid X-API-Key header is present (Mobile Flutter App)
    const apiKey = req.header('X-API-Key');
    if (apiKey && apiKey === env.apiKey) {
        return next();
    }
    // 2. Allow if Authorization Bearer header is present (Admin Panel Dashboard session)
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return next();
    }
    return res.status(401).json({
        success: false,
        message: 'Unauthorized: Missing or invalid API Key / Authorization token',
    });
};
//# sourceMappingURL=apiKeyAuth.js.map