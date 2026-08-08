import { Schema, model } from 'mongoose';
const MediaSchema = new Schema({
    publicId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    resourceType: { type: String, enum: ['image', 'video'], required: true },
    format: String,
    bytes: Number,
    width: Number,
    height: Number,
    duration: Number,
    thumbnailUrl: String,
}, { _id: false });
const WallpaperSchema = new Schema({
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
    storageProvider: { type: String, enum: ['cloudinary', 'r2', 'external'], default: 'cloudinary' },
}, {
    timestamps: true,
});
WallpaperSchema.index({ title: 'text', tags: 'text', categories: 'text' });
WallpaperSchema.index({ type: 1, rank: 1 });
WallpaperSchema.index({ type: 1, rank: 1 }, {
    unique: true,
    partialFilterExpression: { rank: { $type: 'number' } },
    name: 'unique_rank_per_type',
});
WallpaperSchema.index({ isFeatured: 1, updatedAt: -1 });
WallpaperSchema.index({ categories: 1, type: 1, rank: 1 });
WallpaperSchema.index({ 'metrics.clickCount': -1, updatedAt: -1 });
WallpaperSchema.index({ externalSource: 1, externalId: 1 }, { unique: true, sparse: true, name: 'unique_external_source_id' });
export const WallpaperModel = model('Wallpaper', WallpaperSchema);
//# sourceMappingURL=Wallpaper.js.map