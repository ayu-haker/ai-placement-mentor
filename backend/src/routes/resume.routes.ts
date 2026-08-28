import { Router, Request, Response, NextFunction } from 'express';
import {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
} from '../controllers/resume.controller';
import { verifyToken } from '../utils/jwt';
import { uploadResume as uploadMiddleware } from '../middleware/upload';

const router = Router();

// Inline resilient user assignment: Never block file upload due to expired guest token
const attachUser = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let userId = `guest_${Date.now()}`;
  let userEmail = 'guest@placementmentor.app';
  let userRole = 'student';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    if (token && token.length > 5) {
      try {
        const decoded = verifyToken(token);
        if (decoded?.id) {
          userId = decoded.id;
          if (decoded.email) userEmail = decoded.email;
          if (decoded.role) userRole = decoded.role;
        }
      } catch {
        userId = token.startsWith('guest_') ? token : `guest_${Date.now()}`;
      }
    }
  }

  (req as any).user = { id: userId, email: userEmail, role: userRole };
  next();
};

router.post(
  '/upload',
  attachUser,
  (req: Request, res: Response, next: NextFunction) => {
    uploadMiddleware(req, res, (err) => {
      if (err) console.error('Multer upload warning:', err);
      next();
    });
  },
  uploadResume
);

router.get('/', attachUser, getResumes);
router.get('/:id', attachUser, getResumeById);
router.delete('/:id', attachUser, deleteResume);

export default router;
