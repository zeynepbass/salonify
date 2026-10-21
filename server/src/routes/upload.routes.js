import { Router } from 'express';
import { z } from 'zod';
import * as controller from '../controllers/upload.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { uploadLimiter } from '../middlewares/rateLimiters.js';
import { uploadSingleImage } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { objectId } from '../validators/common.js';

const router = Router();

router.post('/', uploadLimiter, authenticate, uploadSingleImage, controller.upload);

router.get('/:fileId', validate({ params: z.object({ fileId: objectId('Görsel kimliği') }) }), controller.download);

export default router;
