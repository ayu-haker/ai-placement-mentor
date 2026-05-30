import { Router } from 'express';
import { getDashboard, getAdminDashboard } from '../controllers/dashboard.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getDashboard);
router.get('/admin', authenticate, requireAdmin, getAdminDashboard);

export default router;
