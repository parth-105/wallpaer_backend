import { Schema, model, Document } from 'mongoose';

export interface IVersionConfig {
  minVersionCode: number;
  preReleaseBlocked: boolean;
  playStoreUrl: string;
  message: string;
}

export interface IAppConfig {
  key: string;
  versionConfig: IVersionConfig;
  updatedAt: Date;
}

export interface IAppConfigDocument extends IAppConfig, Document {}

const appConfigSchema = new Schema<IAppConfigDocument>(
  {
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
  },
  { timestamps: true }
);

export const AppConfig = model<IAppConfigDocument>('AppConfig', appConfigSchema);
