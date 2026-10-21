import multer from 'multer';
import { UPLOAD_MAX_BYTES } from '../constants/index.js';

export const uploadSingleImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_MAX_BYTES, files: 1 },
}).single('file');
