import { Router } from 'express';
import authRoutes from './auth.routes';
import resumeRoutes from './resume.routes';
import interviewRoutes from './interview.routes';
import skillsRoutes from './skills.routes';
import roadmapRoutes from './roadmap.routes';
import counselorRoutes from './counselor.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/interviews', interviewRoutes);
router.use('/skills', skillsRoutes);
router.use('/roadmaps', roadmapRoutes);
router.use('/counselor', counselorRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
