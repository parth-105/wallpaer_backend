import dotenv from 'dotenv';
// Only load .env file in development (not in production on Vercel)
// In production, Vercel injects environment variables automatically
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
const requiredEnv = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
];
for (const key of requiredEnv) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}
export const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 5000),
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    cors: {
        clientOrigin: process.env.CLIENT_ORIGIN ?? '*',
        adminOrigin: process.env.ADMIN_PANEL_ORIGIN ?? '*',
    },
};
//# sourceMappingURL=env.js.map