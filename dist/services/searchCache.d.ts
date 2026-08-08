import type { ExternalWallpaper } from '../types/externalWallpaper.js';
export declare const getCachedSearch: (query: string, type: string, page: number) => ExternalWallpaper[] | undefined;
export declare const setCachedSearch: (query: string, type: string, page: number, results: ExternalWallpaper[]) => void;
export declare const getCachedCategories: () => string[] | undefined;
export declare const setCachedCategories: (categories: string[]) => void;
export declare const clearSearchCache: () => void;
export declare const getCacheStats: () => {
    keys: number;
    hits: number;
    misses: number;
};
//# sourceMappingURL=searchCache.d.ts.map