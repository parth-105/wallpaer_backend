import { Schema, model } from 'mongoose';
const appConfigSchema = new Schema({
    key: { type: String, required: true, unique: true, index: true },
    versionConfig: {
        minVersionCode: { type: Number, default: 1 },
        preReleaseBlocked: { type: Boolean, default: false },
        playStoreUrl: {
            type: String,
            default: 'https://play.google.com/store/apps/details?id=com.live.wallpaper.a3d.a4k',
        },
        message: {
            type: String,
            default: 'This pre-release test version has ended. Please update to the official version on Google Play.',
        },
    },
}, { timestamps: true });
export const AppConfig = model('AppConfig', appConfigSchema);
//# sourceMappingURL=AppConfig.js.map