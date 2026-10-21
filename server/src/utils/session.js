import { env } from '../config/env.js';
import { sendSuccess } from './response.js';

export const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  path: '/api/auth',
};

export function sendSession(res, { refreshToken, ...session }, statusCode = 200) {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
  });
  return sendSuccess(res, session, statusCode);
}

export function clearSession(res) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
}
