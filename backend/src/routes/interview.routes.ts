import { Router } from 'express';
import { body } from 'express-validator';
import {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviews,
  getInterviewById,
} from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/start',
  authenticate,
  [
    body('mode').isIn(['hr', 'technical']).withMessage('Mode must be hr or technical'),
    validate,
  ],
  startInterview
);

router.post(
  '/answer',
  authenticate,
  [
    body('interviewId').notEmpty().withMessage('Interview ID is required'),
    body('questionId').notEmpty().withMessage('Question ID is required'),
    body('answer').notEmpty().withMessage('Answer is required'),
    validate,
  ],
  submitAnswer
);

router.post('/:interviewId/complete', authenticate, completeInterview);
router.get('/', authenticate, getInterviews);
router.get('/:id', authenticate, getInterviewById);

export default router;
