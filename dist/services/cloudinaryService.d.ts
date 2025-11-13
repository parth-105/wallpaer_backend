import { UploadApiResponse } from 'cloudinary';
interface UploadOptions {
    folder?: string;
    resourceType: 'image' | 'video';
    publicId?: string;
}
export interface SignedUploadParams {
    timestamp: number;
    signature: string;
    api_key: string;
    folder?: string;
    resource_type: 'image' | 'video';
}
export declare function uploadBufferToCloudinary(buffer: Buffer, options: UploadOptions): Promise<UploadApiResponse>;
export declare function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video'): Promise<void>;
/**
 * Generate signed upload parameters for client-side uploads
 * This allows large files to be uploaded directly to Cloudinary, bypassing serverless function limits
 */
export declare function generateSignedUploadParams(resourceType: 'image' | 'video', folder?: string): SignedUploadParams;
/**
 * Get Cloudinary upload URL for client-side uploads
 */
export declare function getCloudinaryUploadUrl(): string;
/**
 * Verify and get Cloudinary resource details from public ID or URL
 */
export declare function getCloudinaryResource(publicIdOrUrl: string): Promise<UploadApiResponse>;
export {};
//# sourceMappingURL=cloudinaryService.d.ts.map