import dotenv from 'dotenv';
// Only load .env file in development (not in production on Vercel)
// In production, Vercel injects environment variables automatically
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
// Graceful fallback values to prevent Vercel serverless cold-start crashes
export const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 5000),
    mongoUri: process.env.MONGODB_URI ?? '',
    jwtSecret: process.env.JWT_SECRET ?? 'wallpaper_jwt_secret_key_2026_prod',
    apiKey: process.env.API_KEY ?? 'wp_prod_4f8b92c1e6d7a3_secure_api',
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
        apiKey: process.env.CLOUDINARY_API_KEY ?? '',
        apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    },
    cors: {
        clientOrigin: process.env.CLIENT_ORIGIN ?? '*',
        adminOrigin: process.env.ADMIN_PANEL_ORIGIN ?? '*',
    },
    r2: {
        accountId: process.env.R2_ACCOUNT_ID ?? '',
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
        bucketName: process.env.R2_BUCKET_NAME ?? 'wallpaper-assets',
        publicUrl: process.env.R2_PUBLIC_URL ?? '',
    },
    pixabay: {
        apiKey: process.env.PIXABAY_API_KEY ?? '',
    },
    wallhaven: {
        apiKey: process.env.WALLHAVEN_API_KEY ?? '',
    },
    pexels: {
        apiKey: process.env.PEXELS_API_KEY ?? '',
    },
    unsplash: {
        accessKey: process.env.UNSPLASH_ACCESS_KEY ?? '',
    },
};
//# sourceMappingURL=env.js.map