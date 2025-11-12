import { Schema, model, Document } from 'mongoose';

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

const MediaSchema = new Schema<MediaInfo>(
  {
    publicId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    resourceType: { type: String, enum: ['image', 'video'], required: true },
    format: String,
    bytes: Number,
    width: Number,
    height: Number,
    duration: Number,
    thumbnailUrl: String,
  },
  { _id: false }
);

const WallpaperSchema = new Schema<IWallpaperDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ['static', 'live'], required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    tags: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    rank: { type: Number, min: 1 },
    isFeatured: { type: Boolean, default: false },
    media: { type: MediaSchema, required: true },
    externalSource: String,
    externalId: String,
    metadata: { type: Schema.Types.Mixed },
    publishedAt: Date,
    metrics: {
      clickCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

WallpaperSchema.index({ title: 'text', tags: 'text', categories: 'text' });
WallpaperSchema.index({ type: 1, rank: 1 });
WallpaperSchema.index(
  { type: 1, rank: 1 },
  {
    unique: true,
    partialFilterExpression: { rank: { $type: 'number' } },
    name: 'unique_rank_per_type',
  }
);
WallpaperSchema.index({ isFeatured: 1, updatedAt: -1 });

export const WallpaperModel = model<IWallpaperDocument>('Wallpaper', WallpaperSchema);
