import { Router } from 'express';
import * as controller from '../controllers/notification.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { listNotificationsSchema, notificationIdSchema } from '../validators/notification.validator.js';

const router = Router();

// Müşteri de salon da aynı uçları kullanır; herkes yalnızca kendi
// bildirimlerini görür.
router.use(authenticate);

router.get('/', validate(listNotificationsSchema), controller.list);
// Sabit yol, parametreli yoldan önce tanımlanmalı; aksi halde "read-all"
// bir notificationId gibi yorumlanır.
router.patch('/read-all', controller.markAllRead);
router.patch('/:notificationId/read', validate(notificationIdSchema), controller.markRead);

export default router;
