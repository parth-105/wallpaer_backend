import streamifier from 'streamifier';
import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';
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
/**
 * Generate signed upload parameters for client-side uploads
 * This allows large files to be uploaded directly to Cloudinary, bypassing serverless function limits
 */
export function generateSignedUploadParams(resourceType, folder) {
    // Validate environment variables
    if (!env.cloudinary.apiKey || env.cloudinary.apiKey.trim() === '') {
        throw new Error('CLOUDINARY_API_KEY is not configured or is empty');
    }
    if (!env.cloudinary.apiSecret || env.cloudinary.apiSecret.trim() === '') {
        throw new Error('CLOUDINARY_API_SECRET is not configured or is empty');
    }
    if (!env.cloudinary.cloudName || env.cloudinary.cloudName.trim() === '') {
        throw new Error('CLOUDINARY_CLOUD_NAME is not configured or is empty');
    }
    const timestamp = Math.round(new Date().getTime() / 1000);
    // Cloudinary signature calculation:
    // - Only includes: timestamp, folder (and other optional parameters like public_id, etc.)
    // - Does NOT include: api_key, resource_type (these are sent but not signed)
    // - Parameters are sorted alphabetically for signature generation
    const params = {
        timestamp,
    };
    if (folder) {
        params.folder = folder;
    }
    // Generate signature using only timestamp and folder (not api_key or resource_type)
    // The cloudinary.utils.api_sign_request automatically sorts parameters alphabetically
    const signature = cloudinary.utils.api_sign_request(params, env.cloudinary.apiSecret);
    const result = {
        timestamp,
        signature,
        api_key: env.cloudinary.apiKey, // This should always be set after validation
        resource_type: resourceType,
    };
    if (folder) {
        result.folder = folder;
    }
    // Double-check api_key is set (defensive programming)
    if (!result.api_key || result.api_key.trim() === '') {
        throw new Error('Cloudinary API key is missing in signed upload params');
    }
    return result;
}
/**
 * Get Cloudinary upload URL for client-side uploads
 */
export function getCloudinaryUploadUrl() {
    return `https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/upload`;
}
/**
 * Verify and get Cloudinary resource details from public ID or URL
 */
export async function getCloudinaryResource(publicIdOrUrl) {
    let publicId = publicIdOrUrl;
    // Extract public ID from URL if URL is provided
    if (publicIdOrUrl.includes('cloudinary.com')) {
        const urlParts = publicIdOrUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex !== -1 && urlParts[uploadIndex + 1]) {
            // Extract public ID from URL
            const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
            if (pathAfterUpload) {
                publicId = pathAfterUpload.split('.')[0] || publicIdOrUrl; // Remove extension
            }
        }
    }
    if (!publicId) {
        throw new Error('Invalid public ID or URL');
    }
    try {
        const result = await cloudinary.api.resource(publicId);
        return result;
    }
    catch (error) {
        throw new Error(`Failed to get Cloudinary resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
//# sourceMappingURL=cloudinaryService.js.map