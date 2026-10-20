import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { clearSession, REFRESH_COOKIE, sendSession } from '../utils/session.js';

export async function register(req, res) {
  sendSession(res, await authService.register(req.body), 201);
}

export async function login(req, res) {
  sendSession(res, await authService.login(req.body));
}

export async function refresh(req, res) {
  sendSession(res, await authService.refresh(req.cookies[REFRESH_COOKIE]));
}

export async function logout(req, res) {
  await authService.logout(req.cookies[REFRESH_COOKIE]);
  clearSession(res);
  sendSuccess(res, { message: 'Çıkış yapıldı.' });
}

export async function me(req, res) {
  sendSuccess(res, await authService.buildProfile(req.user));
}
