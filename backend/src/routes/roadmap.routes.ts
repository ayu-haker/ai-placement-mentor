import { Router } from 'express';
import { body } from 'express-validator';
import {
  generateRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateWeekProgress,
} from '../controllers/roadmap.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/generate',
  authenticate,
  [
    body('targetRole').notEmpty().withMessage('Target role is required'),
    validate,
  ],
  generateRoadmap
);

router.get('/', authenticate, getRoadmaps);
router.get('/:id', authenticate, getRoadmapById);
router.put(
  '/:id/progress',
  authenticate,
  [
    body('weekNumber').isInt({ min: 1 }).withMessage('Valid week number is required'),
    body('completed').isBoolean().withMessage('Completed must be boolean'),
    validate,
  ],
  updateWeekProgress
);

export default router;
