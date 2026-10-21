import * as appointmentService from '../services/appointment.service.js';
import * as catalogService from '../services/catalog.service.js';
import { getDashboard } from '../services/dashboard.service.js';
import * as portfolioService from '../services/portfolio.service.js';
import * as salonService from '../services/salon.service.js';
import * as scheduleService from '../services/schedule.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getMySalon(req, res) {
  sendSuccess(res, req.salon);
}

export async function updateMySalon(req, res) {
  sendSuccess(res, await salonService.updateSalonProfile(req.salon, req.body));
}

export async function dashboard(req, res) {
  sendSuccess(res, await getDashboard(req.salon));
}

export async function listServices(req, res) {
  sendSuccess(res, await catalogService.listSalonServices(req.salon._id));
}

export async function createService(req, res) {
  sendSuccess(res, await catalogService.createService(req.salon._id, req.body), 201);
}

export async function updateService(req, res) {
  sendSuccess(res, await catalogService.updateService(req.salon._id, req.params.serviceId, req.body));
}

export async function deleteService(req, res) {
  await catalogService.deleteService(req.salon._id, req.params.serviceId);
  sendSuccess(res, { message: 'Hizmet silindi.' });
}

export async function updateWorkingHours(req, res) {
  sendSuccess(res, await scheduleService.updateWorkingHours(req.salon._id, req.body.days));
}

export async function createBlockedDate(req, res) {
  sendSuccess(res, await scheduleService.addBlockedDate(req.salon._id, req.body), 201);
}

export async function deleteBlockedDate(req, res) {
  await scheduleService.removeBlockedDate(req.salon._id, req.params.id);
  sendSuccess(res, { message: 'Kapalı gün kaldırıldı.' });
}

export async function listAppointments(req, res) {
  sendSuccess(res, await appointmentService.listSalonAppointments({ salonId: req.salon._id, ...req.query }));
}

export async function createAppointment(req, res) {
  sendSuccess(res, await appointmentService.createSalonAppointment(req.salon._id, req.body), 201);
}

export async function updateAppointment(req, res) {
  sendSuccess(res, await appointmentService.updateSalonAppointment(req.salon._id, req.params.appointmentId, req.body));
}

export async function cancelAppointment(req, res) {
  sendSuccess(
    res,
    await appointmentService.cancelSalonAppointment(req.salon._id, req.params.appointmentId, req.body.reason),
  );
}

export async function listPortfolio(req, res) {
  sendSuccess(res, await portfolioService.listSalonPortfolio(req.salon._id));
}

export async function createPortfolioItem(req, res) {
  sendSuccess(res, await portfolioService.createPortfolioItem(req.salon._id, req.body), 201);
}

export async function updatePortfolioItem(req, res) {
  sendSuccess(res, await portfolioService.updatePortfolioItem(req.salon._id, req.params.itemId, req.body));
}

export async function deletePortfolioItem(req, res) {
  await portfolioService.deletePortfolioItem(req.salon._id, req.params.itemId);
  sendSuccess(res, { message: 'Portföy görseli silindi.' });
}
