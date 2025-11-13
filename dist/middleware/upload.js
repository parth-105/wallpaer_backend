import multer from 'multer';
import createHttpError from 'http-errors';
// Vercel serverless functions have a 4.5MB body size limit
// For files larger than this, use client-side Cloudinary upload
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB (slightly under Vercel's 4.5MB limit)
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        fieldSize: 10 * 1024 * 1024, // 10 MB for form fields
    },
    fileFilter: (_req, file, cb) => {
        // Accept images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        }
        else {
            cb(createHttpError(400, 'Invalid file type. Only images and videos are allowed.'));
        }
    },
});
// Error handler for multer errors
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(createHttpError(413, 'File too large. For files larger than 4MB, use the Cloudinary upload endpoint.'));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(createHttpError(400, 'Unexpected file field. Use "media" as the field name.'));
        }
        return next(createHttpError(400, `Upload error: ${err.message}`));
    }
    if (err) {
        return next(err);
    }
    next();
};
//# sourceMappingURL=upload.js.map