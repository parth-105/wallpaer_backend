import { Router } from 'express';
import authRoutes from './authRoutes.js';
import publicRoutes from './publicRoutes.js';
import adminRoutes from './adminRoutes.js';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';
const router = Router();
router.use('/auth', authRoutes);
router.use('/public', apiKeyAuth, publicRoutes);
router.use('/admin', adminRoutes);
export default router;
//# sourceMappingURL=index.js.map