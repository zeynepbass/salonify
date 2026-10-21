import { Router } from 'express';
import * as controller from '../controllers/appointment.controller.js';
import { customerOnly } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  appointmentIdSchema,
  bookAppointmentSchema,
  cancelAppointmentSchema,
  listCustomerAppointmentsSchema,
  updateCustomerAppointmentSchema,
} from '../validators/appointment.validator.js';
import { createReviewSchema } from '../validators/review.validator.js';

const router = Router();

router.use(customerOnly);

router.post('/', validate(bookAppointmentSchema), controller.book);
router.get('/', validate(listCustomerAppointmentsSchema), controller.list);
router.get('/:appointmentId', validate(appointmentIdSchema), controller.getOne);
router.patch('/:appointmentId', validate(updateCustomerAppointmentSchema), controller.update);
router.delete('/:appointmentId', validate(cancelAppointmentSchema), controller.cancel);
router.post('/:appointmentId/review', validate(createReviewSchema), controller.createReview);

export default router;
