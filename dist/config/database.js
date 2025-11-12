import mongoose from 'mongoose';
import { env } from './env.js';
mongoose.set('strictQuery', true);
export async function connectDatabase() {
    try {
        const conn = await mongoose.connect(env.mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        return conn;
    }
    catch (error) {
        console.error('MongoDB connection error', error);
        throw error;
    }
}
//# sourceMappingURL=database.js.map