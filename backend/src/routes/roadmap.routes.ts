import { Router, Request, Response, NextFunction } from 'express';
import {
  generateRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateWeekProgress,
} from '../controllers/roadmap.controller';
import { verifyToken } from '../utils/jwt';

const router = Router();

// Inline resilient user attachment: Never block roadmap generation
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

router.post('/generate', attachUser, generateRoadmap);
router.get('/', attachUser, getRoadmaps);
router.get('/:id', attachUser, getRoadmapById);
router.put('/:id/progress', attachUser, updateWeekProgress);

export default router;
