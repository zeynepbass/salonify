import { Router } from 'express';
import appointmentRoutes from './appointment.routes.js';
import authRoutes from './auth.routes.js';
import notificationRoutes from './notification.routes.js';
import salonRoutes from './salon.routes.js';
import salonPanelRoutes from './salonPanel.routes.js';
import uploadRoutes from './upload.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/salons', salonRoutes);
router.use('/salon/me', salonPanelRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/uploads', uploadRoutes);

export default router;
