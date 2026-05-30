import { Router } from 'express';
import { body } from 'express-validator';
import {
  analyzeSkillGap,
  getSkillAssessments,
  getSkillAssessmentById,
} from '../controllers/skills.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/analyze',
  authenticate,
  [
    body('targetRole').notEmpty().withMessage('Target role is required'),
    validate,
  ],
  analyzeSkillGap
);

router.get('/', authenticate, getSkillAssessments);
router.get('/:id', authenticate, getSkillAssessmentById);

export default router;
