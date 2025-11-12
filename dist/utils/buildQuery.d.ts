import { FilterQuery } from 'mongoose';
import { IWallpaperDocument } from '../models/Wallpaper.js';
type QueryOptions = Partial<{
    type: string | null | undefined;
    status: string | null | undefined;
    tags: string | null | undefined;
    search: string | null | undefined;
}>;
export declare function buildWallpaperQuery(query: QueryOptions): FilterQuery<IWallpaperDocument>;
export {};
//# sourceMappingURL=buildQuery.d.ts.map