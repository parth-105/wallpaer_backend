import { Request, Response, NextFunction } from 'express';
export declare function listWallpapers(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getWallpaperById(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getFeaturedWallpapers(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function recordWallpaperClick(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=wallpaperController.d.ts.map