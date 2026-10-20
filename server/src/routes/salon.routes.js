import { Router } from 'express';
import * as controller from '../controllers/salon.controller.js';
import { validate } from '../middlewares/validate.js';
import { availabilitySchema } from '../validators/appointment.validator.js';
import { paginationOnlyQuery, salonIdParams } from '../validators/common.js';
import { listSalonsSchema } from '../validators/salon.validator.js';

// Herkese açık uçlar: salonları keşfetmek için giriş yapmak gerekmez.
const router = Router();
const salonId = validate({ params: salonIdParams });

router.get('/', validate(listSalonsSchema), controller.listSalons);
router.get('/:salonId', salonId, controller.getSalon);
router.get('/:salonId/services', salonId, controller.listServices);
router.get('/:salonId/working-hours', salonId, controller.getWorkingHours);
router.get('/:salonId/blocked-dates', salonId, controller.listBlockedDates);
router.get('/:salonId/availability', validate(availabilitySchema), controller.getSalonAvailability);
router.get('/:salonId/portfolio', salonId, controller.listPortfolio);
router.get('/:salonId/reviews', validate({ params: salonIdParams, query: paginationOnlyQuery }), controller.listReviews);

export default router;
