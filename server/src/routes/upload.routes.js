import { Router } from 'express';
import { z } from 'zod';
import * as controller from '../controllers/upload.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { uploadLimiter } from '../middlewares/rateLimiters.js';
import { uploadSingleImage } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { objectId } from '../validators/common.js';

const router = Router();

// Yükleme yalnızca giriş yapmış kullanıcılara açıktır. authenticate,
// dosya okunmadan ÖNCE çalışır; anonim istekler için bellek harcanmaz.
router.post('/', uploadLimiter, authenticate, uploadSingleImage, controller.upload);

// Görseller herkese açık sayfalarda gösterildiği için okuma giriş gerektirmez.
router.get('/:fileId', validate({ params: z.object({ fileId: objectId('Görsel kimliği') }) }), controller.download);

export default router;
