import { Request, Response, NextFunction } from 'express';
/**
 * Generate signed upload parameters for client-side uploads
 * This endpoint returns Cloudinary upload parameters that allow the client to upload directly to Cloudinary
 * This bypasses Vercel's 4.5MB body size limit for serverless functions
 */
export declare function getUploadParams(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=uploadController.d.ts.map