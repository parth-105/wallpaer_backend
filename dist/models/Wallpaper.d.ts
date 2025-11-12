import { Document } from 'mongoose';
export type WallpaperType = 'static' | 'live';
export type WallpaperStatus = 'draft' | 'published';
export interface MediaInfo {
    publicId: string;
    url: string;
    resourceType: 'image' | 'video';
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
    duration?: number;
    thumbnailUrl?: string;
}
export interface EngagementMetrics {
    clickCount: number;
}
export interface IWallpaper {
    title: string;
    description?: string;
    type: WallpaperType;
    status: WallpaperStatus;
    tags: string[];
    categories: string[];
    rank?: number | null;
    isFeatured: boolean;
    media: MediaInfo;
    externalSource?: string;
    externalId?: string;
    metadata?: Record<string, unknown>;
    publishedAt?: Date;
    metrics: EngagementMetrics;
}
export interface IWallpaperDocument extends IWallpaper, Document {
    createdAt: Date;
    updatedAt: Date;
}
export declare const WallpaperModel: import("mongoose").Model<IWallpaperDocument, {}, {}, {}, Document<unknown, {}, IWallpaperDocument, {}, {}> & IWallpaperDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Wallpaper.d.ts.map