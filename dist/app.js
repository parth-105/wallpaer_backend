import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from './routes/index.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './utils/logger.js';
import { env } from './config/env.js';
const app = express();
// Get allowed origins, handle wildcard and empty values
const clientOrigin = env.cors.clientOrigin;
const adminOrigin = env.cors.adminOrigin;
const allowedOrigins = [];
// Production frontend URL (from user's message)
const productionFrontendUrl = 'https://wallpaer-admin-frontend.vercel.app';
// Add origins if they're not wildcards
if (clientOrigin && clientOrigin !== '*') {
    allowedOrigins.push(clientOrigin);
}
if (adminOrigin && adminOrigin !== '*') {
    allowedOrigins.push(adminOrigin);
}
// Always add production frontend URL if not already added
if (!allowedOrigins.includes(productionFrontendUrl)) {
    allowedOrigins.push(productionFrontendUrl);
}
// CORS configuration - allow localhost in development, specific origins in production
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
            return callback(null, true);
        }
        // In development, always allow localhost and production URL
        if (env.nodeEnv === 'development') {
            // Check if it's a localhost origin
            try {
                const originUrl = new URL(origin);
                const isLocalhost = originUrl.hostname === 'localhost' ||
                    originUrl.hostname === '127.0.0.1' ||
                    originUrl.hostname.startsWith('192.168.');
                if (isLocalhost) {
                    return callback(null, true);
                }
                // Also allow production URL in development for testing
                if (origin === productionFrontendUrl) {
                    return callback(null, true);
                }
            }
            catch {
                // Invalid URL, allow it in development
            }
            // Allow all origins in development (permissive for local testing)
            return callback(null, true);
        }
        // In production, check allowed list
        if (allowedOrigins.length > 0) {
            // Exact match
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            // Pattern match (check hostname)
            const isAllowed = allowedOrigins.some((allowed) => {
                try {
                    const allowedUrl = new URL(allowed);
                    const originUrl = new URL(origin);
                    return allowedUrl.hostname === originUrl.hostname;
                }
                catch {
                    return origin === allowed;
                }
            });
            if (isAllowed) {
                return callback(null, true);
            }
            // Origin not allowed
            console.warn(`[CORS] Origin ${origin} is not allowed. Allowed origins: ${allowedOrigins.join(', ')}`);
            return callback(new Error(`Origin ${origin} is not allowed by CORS. Allowed origins: ${allowedOrigins.join(', ')}`));
        }
        // No origins specified, allow all (should not happen in production)
        console.warn('[CORS] No allowed origins specified, allowing all origins');
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet());
app.use(compression());
// Vercel serverless functions have a 4.5MB body size limit
// Set limit to 4MB to leave room for other data
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));
app.use(requestLogger);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});
// Test route to verify route registration
app.get('/test-routes', (_req, res) => {
    res.json({
        success: true,
        message: 'Routes are working',
        routes: {
            public: '/public/wallpapers',
            admin: '/admin/upload-params',
            api: '/api/public/wallpapers',
        },
    });
});
// Mount routes at /api (primary path)
app.use('/api', routes);
// Also mount routes without /api prefix for backward compatibility
// This allows frontend to call /public/wallpapers or /api/public/wallpapers
// These routes use the same controllers and middleware as /api routes
// IMPORTANT: Routes must be mounted AFTER /api routes but BEFORE catch-all handler
app.use('/public', publicRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
// Log route registration in development
if (env.nodeEnv === 'development') {
    console.log('[Route Registration] Public routes mounted at /public');
    console.log('[Route Registration] Admin routes mounted at /admin');
    console.log('[Route Registration] Auth routes mounted at /auth');
}
// Catch-all for unmatched routes (must be after all routes, before error handler)
app.use((req, res, next) => {
    // Only handle if response hasn't been sent
    if (!res.headersSent) {
        res.status(404).json({
            success: false,
            message: `Route not found: ${req.method} ${req.path}`,
            path: req.path,
            method: req.method,
        });
    }
    else {
        next();
    }
});
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map