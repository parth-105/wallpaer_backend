import { Request, Response } from 'express';
/**
 * GET /api/v1/version-check (Public endpoint for Flutter App)
 */
export declare const getVersionStatus: (_req: Request, res: Response) => Promise<void>;
/**
 * GET /admin/version-config (Admin endpoint for Web Admin Panel)
 */
export declare const getAdminVersionConfig: (_req: Request, res: Response) => Promise<void>;
/**
 * PUT /admin/version-config (Admin endpoint to update version config from Web Admin Panel)
 */
export declare const updateAdminVersionConfig: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=versionController.d.ts.map