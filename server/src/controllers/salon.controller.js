import { getAvailability } from '../services/availability.service.js';
import * as catalogService from '../services/catalog.service.js';
import * as reviewService from '../services/review.service.js';
import * as salonService from '../services/salon.service.js';
import * as scheduleService from '../services/schedule.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listSalons(req, res) {
  sendSuccess(res, await salonService.listSalons(req.query));
}

export async function getSalon(req, res) {
  sendSuccess(res, await salonService.getSalonDetail(req.params.salonId));
}

export async function listServices(req, res) {
  const salon = await salonService.assertSalonExists(req.params.salonId);
  sendSuccess(res, await catalogService.listActiveServices(salon._id));
}

export async function getWorkingHours(req, res) {
  const salon = await salonService.assertSalonExists(req.params.salonId);
  sendSuccess(res, await scheduleService.getWorkingHours(salon._id));
}

export async function listBlockedDates(req, res) {
  const salon = await salonService.assertSalonExists(req.params.salonId);
  sendSuccess(res, await scheduleService.listBlockedDates(salon._id));
}

export async function getSalonAvailability(req, res) {
  sendSuccess(res, await getAvailability({ salonId: req.params.salonId, ...req.query }));
}

export async function listPortfolio(req, res) {
  const salon = await salonService.assertSalonExists(req.params.salonId);
  sendSuccess(res, await salonService.listPublicPortfolio(salon._id));
}

export async function listReviews(req, res) {
  sendSuccess(res, await reviewService.listSalonReviews({ salonId: req.params.salonId, ...req.query }));
}
