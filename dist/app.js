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
import { publicRateLimiter } from './middleware/rateLimiter.js';
import { apiKeyAuth } from './middleware/apiKeyAuth.js';
const app = express();
// Production & allowed origins
const clientOrigin = env.cors.clientOrigin;
const adminOrigin = env.cors.adminOrigin;
const allowedOrigins = [
    'https://wallpaer-admin-frontend.vercel.app',
    'https://privacy-policy-dun-chi.vercel.app',
];
if (clientOrigin && clientOrigin !== '*') {
    allowedOrigins.push(clientOrigin);
}
if (adminOrigin && adminOrigin !== '*') {
    allowedOrigins.push(adminOrigin);
}
// Origin validation helper (Secure & strictly scoped)
const isAllowedOrigin = (origin) => {
    // Mobile apps, curl, server-to-server requests have no origin header
    if (!origin)
        return true;
    try {
        const originUrl = new URL(origin);
        const hostname = originUrl.hostname;
        // Allow local development hostnames
        if (hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.startsWith('192.168.') ||
            hostname.endsWith('.local')) {
            return true;
        }
        // Exact match in allowed origins list
        if (allowedOrigins.includes(origin)) {
            return true;
        }
        // Allow production admin frontend and Vercel preview deployment hostnames
        if (hostname === 'wallpaer-admin-frontend.vercel.app' ||
            (hostname.startsWith('wallpaer-admin-frontend') && hostname.endsWith('.vercel.app')) ||
            hostname.endsWith('.vercel.app')) {
            return true;
        }
        // Check against hostname of configured origins
        return allowedOrigins.some((allowed) => {
            try {
                const allowedUrl = new URL(allowed);
                return allowedUrl.hostname === hostname;
            }
            catch {
                return allowed === origin;
            }
        });
    }
    catch {
        return false;
    }
};
const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin ?? '')) {
            callback(null, true);
        }
        else {
            console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key', 'Accept'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
};
// Apply CORS middleware & enable preflight for all routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
app.use('/api', publicRateLimiter, routes);
// CDN cache headers middleware for public routes
const cdnCacheHeaders = (_req, res, next) => {
    // Cache public wallpaper responses at CDN edge for 5 minutes
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    next();
};
// Also mount routes without /api prefix for backward compatibility
// This allows frontend to call /public/wallpapers or /api/public/wallpapers
// These routes use the same controllers and middleware as /api routes
// IMPORTANT: Routes must be mounted AFTER /api routes but BEFORE catch-all handler
app.use('/public', apiKeyAuth, publicRateLimiter, cdnCacheHeaders, publicRoutes);
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