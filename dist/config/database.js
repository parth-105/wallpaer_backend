import mongoose from 'mongoose';
import { env } from './env.js';
mongoose.set('strictQuery', true);
// Cache connection for serverless environments (like Vercel)
let connectionPromise = null;
export async function connectDatabase() {
    // Check if already connected (readyState: 1 = connected)
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }
    // If connection is in progress, wait for it
    if (connectionPromise) {
        return connectionPromise;
    }
    // Start new connection
    connectionPromise = (async () => {
        try {
            const conn = await mongoose.connect(env.mongoUri, {
                serverSelectionTimeoutMS: 5000,
                // Optimize for serverless
                maxPoolSize: 1, // Limit connection pool in serverless
                minPoolSize: 1,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 10000,
            });
            // Handle connection events
            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
                connectionPromise = null; // Allow retry on error
            });
            mongoose.connection.on('disconnected', () => {
                connectionPromise = null; // Allow reconnection
            });
            return conn;
        }
        catch (error) {
            connectionPromise = null; // Reset on error to allow retry
            console.error('MongoDB connection error', error);
            throw error;
        }
    })();
    return connectionPromise;
}
//# sourceMappingURL=database.js.map