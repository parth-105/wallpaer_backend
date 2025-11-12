import streamifier from 'streamifier';
import { cloudinary } from '../config/cloudinary.js';
export async function uploadBufferToCloudinary(buffer, options) {
    // Validate buffer
    if (!buffer || buffer.length === 0) {
        throw new Error('Buffer is empty or invalid');
    }
    // Validate resource type
    if (!options.resourceType || !['image', 'video'].includes(options.resourceType)) {
        throw new Error('Invalid resource type. Must be "image" or "video"');
    }
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
            if (error) {
                reject(new Error(`Cloudinary upload failed: ${error.message}`));
            }
            else if (!result) {
                reject(new Error('Cloudinary upload failed: No result returned'));
            }
            else {
                resolve(result);
            }
        });
        stream.on('error', (error) => {
            reject(new Error(`Stream error: ${error.message}`));
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
}
export async function deleteFromCloudinary(publicId, resourceType) {
    if (!publicId || typeof publicId !== 'string') {
        throw new Error('Public ID is required and must be a string');
    }
    if (!resourceType || !['image', 'video'].includes(resourceType)) {
        throw new Error('Resource type must be "image" or "video"');
    }
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        if (result.result === 'not found') {
            console.warn(`Cloudinary asset not found: ${publicId}`);
        }
    }
    catch (error) {
        throw new Error(`Failed to delete from Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
//# sourceMappingURL=cloudinaryService.js.map