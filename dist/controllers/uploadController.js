import createHttpError from 'http-errors';
import { generateSignedUploadParams, getCloudinaryUploadUrl } from '../services/cloudinaryService.js';
import { createResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';
import { logInfo, logError } from '../utils/logger.js';
/**
 * Generate signed upload parameters for client-side uploads
 * This endpoint returns Cloudinary upload parameters that allow the client to upload directly to Cloudinary
 * This bypasses Vercel's 4.5MB body size limit for serverless functions
 */
export async function getUploadParams(req, res, next) {
    try {
        const { type, folder } = req.query;
        // Normalize type: accept "static" or "live" as well as "image" or "video"
        let resourceType;
        let normalizedType = String(type || '').toLowerCase().trim();
        if (normalizedType === 'static' || normalizedType === 'image') {
            resourceType = 'image';
        }
        else if (normalizedType === 'live' || normalizedType === 'video') {
            resourceType = 'video';
        }
        else {
            throw createHttpError(400, 'Type must be "static", "live", "image", or "video"');
        }
        // Determine folder based on type
        const uploadFolder = folder
            ? String(folder)
            : resourceType === 'video'
                ? 'wallpapers/live'
                : 'wallpapers/static';
        // Generate signed upload parameters
        const params = generateSignedUploadParams(resourceType, uploadFolder);
        const uploadUrl = getCloudinaryUploadUrl();
        // Validate params before returning (defensive check)
        if (!params.api_key || params.api_key.trim() === '') {
            logError('Cloudinary API key is missing in upload params', { params });
            throw createHttpError(500, 'Cloudinary API key is not configured');
        }
        // Explicitly construct response to ensure api_key is included
        const responseData = {
            uploadUrl,
            params: {
                timestamp: params.timestamp,
                signature: params.signature,
                api_key: params.api_key, // Explicitly ensure api_key is included
                resource_type: params.resource_type,
                ...(params.folder && { folder: params.folder }), // Only include folder if present
            },
            cloudName: env.cloudinary.cloudName, // Use env instead of process.env for consistency
        };
        // Log in development for debugging
        if (env.nodeEnv === 'development') {
            logInfo('Upload params generated', {
                resourceType,
                folder: uploadFolder,
                hasApiKey: !!params.api_key,
                apiKeyLength: params.api_key?.length || 0,
                uploadUrl,
            });
        }
        res.json(createResponse({
            data: responseData,
        }));
    }
    catch (error) {
        logError('Error generating upload params', error);
        next(error);
    }
}
//# sourceMappingURL=uploadController.js.map