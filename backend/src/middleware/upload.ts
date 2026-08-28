import multer from 'multer';

// Use memoryStorage for robust cloud/serverless compatibility (no disk permission issues)
const storage = multer.memoryStorage();

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
}).single('resume');
