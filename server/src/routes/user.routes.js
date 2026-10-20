import { Router } from 'express';
import { ROLES } from '../constants/index.js';
import * as controller from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiters.js';
import { validate } from '../middlewares/validate.js';
import { listCustomerAppointmentsSchema } from '../validators/appointment.validator.js';
import { paginationOnlyQuery } from '../validators/common.js';
import { listNotificationsSchema } from '../validators/notification.validator.js';
import { changePasswordSchema, deleteAccountSchema, updateProfileSchema } from '../validators/user.validator.js';

const router = Router();
const customer = authorize(ROLES.CUSTOMER);

router.use(authenticate);

router.get('/me', controller.getMe);
router.patch('/me', validate(updateProfileSchema), controller.updateMe);
// Şifre denemesi içerdikleri için giriş uçlarıyla aynı sıkı limite tabidir.
router.patch('/me/password', authLimiter, validate(changePasswordSchema), controller.updatePassword);
// Hesap silme frontend'de yalnızca müşteri profilinde bulunur. Salon hesabı
// silmek salonun bütün verisini etkileyeceği için bu uçla yapılamaz.
router.delete('/me', authLimiter, customer, validate(deleteAccountSchema), controller.deleteMe);
router.get('/me/appointments', customer, validate(listCustomerAppointmentsSchema), controller.listMyAppointments);
router.get('/me/reviews', customer, validate({ query: paginationOnlyQuery }), controller.listMyReviews);
router.get('/me/notifications', validate(listNotificationsSchema), controller.listMyNotifications);

export default router;
