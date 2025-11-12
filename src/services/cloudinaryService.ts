import { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';
import { cloudinary } from '../config/cloudinary.js';

interface UploadOptions {
  folder?: string;
  resourceType: 'image' | 'video';
  publicId?: string;
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: UploadOptions
): Promise<UploadApiResponse> {
  const uploadOptions: UploadApiOptions = {
    folder: options.folder ?? 'wallpapers',
    resource_type: options.resourceType,
    overwrite: true,
  };

  if (options.publicId) {
    uploadOptions.public_id = options.publicId;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error || !result) {
        reject(error);
      } else {
        resolve(result);
      }
    });

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video'): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
