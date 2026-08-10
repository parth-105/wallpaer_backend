import { env } from '../config/env.js';
export const apiKeyAuth = (req, res, next) => {
    const apiKey = req.header('X-API-Key');
    if (!apiKey || apiKey !== env.apiKey) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid API Key',
        });
    }
    next();
};
//# sourceMappingURL=apiKeyAuth.js.map