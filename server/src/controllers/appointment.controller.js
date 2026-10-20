import * as appointmentService from '../services/appointment.service.js';
import * as reviewService from '../services/review.service.js';
import { sendSuccess } from '../utils/response.js';

// Müşterinin kendi randevuları. Bütün servis çağrılarına req.user._id
// verilir; servis katmanı randevuyu yalnızca bu müşteriye aitse bulur.

export async function book(req, res) {
  sendSuccess(res, await appointmentService.bookAppointment(req.user, req.body), 201);
}

export async function list(req, res) {
  sendSuccess(res, await appointmentService.listCustomerAppointments({ customerId: req.user._id, ...req.query }));
}

export async function getOne(req, res) {
  sendSuccess(res, await appointmentService.getCustomerAppointment(req.user._id, req.params.appointmentId));
}

export async function update(req, res) {
  sendSuccess(
    res,
    await appointmentService.updateCustomerAppointment(req.user._id, req.params.appointmentId, req.body),
  );
}

// DELETE kaydı silmez, randevuyu CANCELLED durumuna alır. Randevu geçmişi
// hem müşteri hem salon için korunur.
export async function cancel(req, res) {
  sendSuccess(
    res,
    await appointmentService.cancelCustomerAppointment(req.user._id, req.params.appointmentId, req.body.reason),
  );
}

export async function createReview(req, res) {
  sendSuccess(res, await reviewService.createReview(req.user, req.params.appointmentId, req.body), 201);
}
