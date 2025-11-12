import { Request, Response, NextFunction } from 'express';
export declare function createWallpaper(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateWallpaper(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function clearWallpaperRank(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteWallpaper(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function importWallpapers(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=adminWallpaperController.d.ts.map