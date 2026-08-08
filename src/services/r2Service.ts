import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL, isR2Configured } from '../config/r2.js';
import { logInfo, logError } from '../utils/logger.js';

export const getR2PublicUrl = (key: string): string => {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured');
  }
  return `${R2_PUBLIC_URL}/${key}`;
};

export const uploadToR2 = async (buffer: Buffer, key: string, contentType: string): Promise<string> => {
  if (!isR2Configured() || !r2Client) {
    throw new Error('R2 is not configured');
  }

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await r2Client.send(command);
    logInfo(`Successfully uploaded ${key} to R2`);
    return getR2PublicUrl(key);
  } catch (error) {
    logError(`Failed to upload ${key} to R2:`, error);
    throw error;
  }
};

export const deleteFromR2 = async (key: string): Promise<void> => {
  if (!isR2Configured() || !r2Client) {
    throw new Error('R2 is not configured');
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    logInfo(`Successfully deleted ${key} from R2`);
  } catch (error) {
    logError(`Failed to delete ${key} from R2:`, error);
    throw error;
  }
};
