import { Router } from 'express';
import { loginAdmin } from '../controllers/authController.js';
import { ensureDatabase } from '../middleware/ensureDatabase.js';

const router = Router();

// Ensure database connection before handling auth requests
router.use(ensureDatabase);

router.post('/login', loginAdmin);

export default router;
