import { Router } from 'express';
import * as controller from '../controllers/notification.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { listNotificationsSchema, notificationIdSchema } from '../validators/notification.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listNotificationsSchema), controller.list);
router.patch('/read-all', controller.markAllRead);
router.patch('/:notificationId/read', validate(notificationIdSchema), controller.markRead);
router.delete('/', controller.removeAll);
router.delete('/:notificationId', validate(notificationIdSchema), controller.remove);

export default router;
