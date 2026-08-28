import { Router, Request, Response, NextFunction } from 'express';
import {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
} from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth';
import { uploadResume as uploadMiddleware } from '../middleware/upload';

const router = Router();

// Bulletproof upload wrapper: Never crash on multer or file type errors
router.post(
  '/upload',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error('Multer file upload error (handled):', err);
      }
      next();
    });
  },
  uploadResume
);

router.get('/', authenticate, getResumes);
router.get('/:id', authenticate, getResumeById);
router.delete('/:id', authenticate, deleteResume);

export default router;
