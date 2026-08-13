import { Router } from 'express';
import {
  getFeaturedWallpapers,
  getWallpaperById,
  listWallpapers,
  recordWallpaperClick,
} from '../controllers/wallpaperController.js';
import { ensureDatabase } from '../middleware/ensureDatabase.js';
import { getVersionStatus } from '../controllers/versionController.js';
import searchRoutes from './searchRoutes.js';

const router = Router();

// Ensure database connection for all public routes
router.use(ensureDatabase);

router.get('/wallpapers', listWallpapers);
router.get('/wallpapers/featured', getFeaturedWallpapers);
router.get('/wallpapers/:id', getWallpaperById);
router.post('/wallpapers/:id/click', recordWallpaperClick);

// Search routes (multi-source: Pexels + Pixabay + Wallhaven)
router.use('/search', searchRoutes);

// App version control & pre-release kill-switch status
router.get('/version-check', getVersionStatus);

export default router;
