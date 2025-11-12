import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { startSchedulers } from './services/scheduler.js';
import { logInfo, logError } from './utils/logger.js';
async function startServer() {
    try {
        await connectDatabase();
        logInfo('Connected to MongoDB');
        const server = http.createServer(app);
        startSchedulers();
        server.listen(env.port, () => {
            logInfo(`Server listening on port ${env.port}`);
        });
    }
    catch (error) {
        logError('Failed to start server', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map