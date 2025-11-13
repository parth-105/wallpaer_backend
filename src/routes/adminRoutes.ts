import { Router } from 'express';
import {
  clearWallpaperRank,
  createWallpaper,
  deleteWallpaper,
  importWallpapers,
  updateWallpaper,
} from '../controllers/adminWallpaperController.js';
import { getUploadParams } from '../controllers/uploadController.js';
import { authenticateJwt } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { upload, handleMulterError } from '../middleware/upload.js';
import { ensureDatabase } from '../middleware/ensureDatabase.js';

const router = Router();

// Ensure database connection for all admin routes
router.use(ensureDatabase);

// Authenticate and require admin role
router.use(authenticateJwt, requireAdmin);

// Get upload parameters for client-side uploads (bypasses Vercel's 4.5MB limit)
router.get('/upload-params', getUploadParams);

// Create wallpaper - supports both file upload and Cloudinary URL
// Use file upload for small files (< 4MB), use Cloudinary URL for large files
router.post('/wallpapers', upload.single('media'), handleMulterError, createWallpaper);
router.patch('/wallpapers/:id', upload.single('media'), handleMulterError, updateWallpaper);
router.delete('/wallpapers/:id/rank', clearWallpaperRank);
router.delete('/wallpapers/:id', deleteWallpaper);
router.post('/wallpapers/import', importWallpapers);

export default router;
