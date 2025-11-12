interface ExternalWallpaper {
    id: string;
    title: string;
    url: string;
    thumbnailUrl?: string;
    type: 'static' | 'live';
    source: string;
}
export declare function fetchFallbackWallpapers(type: 'static' | 'live', limit?: number): Promise<ExternalWallpaper[]>;
export {};
//# sourceMappingURL=fallbackService.d.ts.map