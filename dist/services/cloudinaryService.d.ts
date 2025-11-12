import { UploadApiResponse } from 'cloudinary';
interface UploadOptions {
    folder?: string;
    resourceType: 'image' | 'video';
    publicId?: string;
}
export declare function uploadBufferToCloudinary(buffer: Buffer, options: UploadOptions): Promise<UploadApiResponse>;
export declare function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video'): Promise<void>;
export {};
//# sourceMappingURL=cloudinaryService.d.ts.map