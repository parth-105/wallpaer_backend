import streamifier from 'streamifier';
import { cloudinary } from '../config/cloudinary.js';
export async function uploadBufferToCloudinary(buffer, options) {
    const uploadOptions = {
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
            }
            else {
                resolve(result);
            }
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
}
export async function deleteFromCloudinary(publicId, resourceType) {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
//# sourceMappingURL=cloudinaryService.js.map