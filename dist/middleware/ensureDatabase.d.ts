import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to ensure database connection is established before handling the request
 * This is especially important for serverless environments where connections might be cold
 */
export declare function ensureDatabase(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=ensureDatabase.d.ts.map