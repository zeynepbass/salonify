import * as appointmentService from '../services/appointment.service.js';
import { buildProfile, changePassword } from '../services/auth.service.js';
import * as notificationService from '../services/notification.service.js';
import * as reviewService from '../services/review.service.js';
import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';
import { clearSession, sendSession } from '../utils/session.js';

// Bu dosyadaki bütün uçlar "me" üzerinden çalışır: kullanıcı kimliği URL'den
// değil, doğrulanmış oturumdan (req.user) alınır. Bu yüzden bir müşterinin
// başka bir müşterinin özel verisini istemesinin bir yolu yoktur.

export async function getMe(req, res) {
  sendSuccess(res, await buildProfile(req.user));
}

export async function updateMe(req, res) {
  const user = await userService.updateProfile(req.user, req.body);
  sendSuccess(res, await buildProfile(user));
}

export async function updatePassword(req, res) {
  sendSession(res, await changePassword(req.user._id, req.body));
}

export async function deleteMe(req, res) {
  await userService.deleteAccount(req.user, req.body.password);
  clearSession(res);
  sendSuccess(res, { message: 'Hesabınız silindi.' });
}

export async function listMyAppointments(req, res) {
  sendSuccess(res, await appointmentService.listCustomerAppointments({ customerId: req.user._id, ...req.query }));
}

export async function listMyReviews(req, res) {
  sendSuccess(res, await reviewService.listCustomerReviews({ customerId: req.user._id, ...req.query }));
}

export async function listMyNotifications(req, res) {
  sendSuccess(res, await notificationService.listNotifications({ userId: req.user._id, ...req.query }));
}
