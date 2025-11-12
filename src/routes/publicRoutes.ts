import { Router } from 'express';
import {
  getFeaturedWallpapers,
  getWallpaperById,
  listWallpapers,
  recordWallpaperClick,
} from '../controllers/wallpaperController.js';

const router = Router();

router.get('/wallpapers', listWallpapers);
router.get('/wallpapers/featured', getFeaturedWallpapers);
router.get('/wallpapers/:id', getWallpaperById);
router.post('/wallpapers/:id/click', recordWallpaperClick);

export default router;
