import { Router } from 'express';
import authRoutes from './authRoutes.js';
import publicRoutes from './publicRoutes.js';
import adminRoutes from './adminRoutes.js';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';

import { getVersionStatus } from '../controllers/versionController.js';

const router = Router();

// Version check endpoint (Publicly accessible without API Key for mobile splash screen)
router.get('/version-check', getVersionStatus);

router.use('/auth', authRoutes);
router.use('/public', apiKeyAuth, publicRoutes);
router.use('/admin', adminRoutes);

export default router;
