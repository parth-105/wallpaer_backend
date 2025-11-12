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
export const WallpaperModel = model('Wallpaper', WallpaperSchema);
//# sourceMappingURL=Wallpaper.js.map