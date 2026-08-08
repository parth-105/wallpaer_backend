import { Router } from 'express';
import { searchWallpapers, getCategories, getTrending } from '../controllers/searchController.js';
import { ensureDatabase } from '../middleware/ensureDatabase.js';

const router = Router();
router.use(ensureDatabase);

router.get('/wallpapers', searchWallpapers);
router.get('/categories', getCategories);
router.get('/trending', getTrending);

export default router;
