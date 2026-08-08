import { S3Client } from '@aws-sdk/client-s3';
import { logInfo, logError } from '../utils/logger.js';

export const isR2Configured = (): boolean => {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY
  );
};

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? 'wallpaper-assets';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? '';

let client: S3Client | undefined;

if (isR2Configured()) {
  client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  logInfo('R2 client configured successfully');
} else {
  logError('R2 is not fully configured. Missing required environment variables.');
}

export const r2Client = client;
