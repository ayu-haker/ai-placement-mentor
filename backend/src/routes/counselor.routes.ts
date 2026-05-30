import { Router } from 'express';
import { body } from 'express-validator';
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
} from '../controllers/counselor.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/chat',
  authenticate,
  [
    body('message').notEmpty().withMessage('Message is required'),
    validate,
  ],
  sendMessage
);

router.get('/history', authenticate, getChatHistory);
router.delete('/history', authenticate, clearChatHistory);

export default router;
