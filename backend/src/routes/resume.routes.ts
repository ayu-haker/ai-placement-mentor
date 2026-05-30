import { Router } from 'express';
import {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
} from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth';
import { uploadResume as uploadMiddleware } from '../middleware/upload';

const router = Router();

router.post('/upload', authenticate, uploadMiddleware, uploadResume);
router.get('/', authenticate, getResumes);
router.get('/:id', authenticate, getResumeById);
router.delete('/:id', authenticate, deleteResume);

export default router;
