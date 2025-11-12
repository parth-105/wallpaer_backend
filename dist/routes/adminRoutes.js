import { Router } from 'express';
import { clearWallpaperRank, createWallpaper, deleteWallpaper, importWallpapers, updateWallpaper, } from '../controllers/adminWallpaperController.js';
import { authenticateJwt } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { upload } from '../middleware/upload.js';
const router = Router();
router.use(authenticateJwt, requireAdmin);
router.post('/wallpapers', upload.single('media'), createWallpaper);
router.patch('/wallpapers/:id', upload.single('media'), updateWallpaper);
router.delete('/wallpapers/:id/rank', clearWallpaperRank);
router.delete('/wallpapers/:id', deleteWallpaper);
router.post('/wallpapers/import', importWallpapers);
export default router;
//# sourceMappingURL=adminRoutes.js.map