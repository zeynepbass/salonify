import { Router } from 'express';
import * as controller from '../controllers/salonPanel.controller.js';
import { salonOnly } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  cancelAppointmentSchema,
  createSalonAppointmentSchema,
  listSalonAppointmentsSchema,
  updateSalonAppointmentSchema,
} from '../validators/appointment.validator.js';
import { createPortfolioSchema, portfolioItemIdParams, updatePortfolioSchema } from '../validators/portfolio.validator.js';
import { updateSalonSchema } from '../validators/salon.validator.js';
import { blockedDateIdSchema, createBlockedDateSchema, updateWorkingHoursSchema } from '../validators/schedule.validator.js';
import { createServiceSchema, serviceIdParams, updateServiceSchema } from '../validators/service.validator.js';

const router = Router();

router.use(salonOnly);

router.get('/', controller.getMySalon);
router.patch('/', validate(updateSalonSchema), controller.updateMySalon);
router.get('/dashboard', controller.dashboard);

router.get('/services', controller.listServices);
router.post('/services', validate(createServiceSchema), controller.createService);
router.patch('/services/:serviceId', validate(updateServiceSchema), controller.updateService);
router.delete('/services/:serviceId', validate({ params: serviceIdParams }), controller.deleteService);

router.patch('/working-hours', validate(updateWorkingHoursSchema), controller.updateWorkingHours);
router.post('/blocked-dates', validate(createBlockedDateSchema), controller.createBlockedDate);
router.delete('/blocked-dates/:id', validate(blockedDateIdSchema), controller.deleteBlockedDate);

router.get('/appointments', validate(listSalonAppointmentsSchema), controller.listAppointments);
router.post('/appointments', validate(createSalonAppointmentSchema), controller.createAppointment);
router.patch('/appointments/:appointmentId', validate(updateSalonAppointmentSchema), controller.updateAppointment);
router.delete('/appointments/:appointmentId', validate(cancelAppointmentSchema), controller.cancelAppointment);

router.get('/portfolio', controller.listPortfolio);
router.post('/portfolio', validate(createPortfolioSchema), controller.createPortfolioItem);
router.patch('/portfolio/:itemId', validate(updatePortfolioSchema), controller.updatePortfolioItem);
router.delete('/portfolio/:itemId', validate({ params: portfolioItemIdParams }), controller.deletePortfolioItem);

export default router;
