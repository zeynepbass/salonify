import { env } from '../config/env.js';
import { sendSuccess } from './response.js';

export const REFRESH_COOKIE = 'refreshToken';

// Refresh token tarayıcıya httpOnly cookie olarak verilir.
// - httpOnly: JavaScript cookie'yi okuyamaz; XSS ile token çalınamaz.
// - secure: production'da yalnızca HTTPS üzerinden gönderilir.
// - sameSite: frontend ve API farklı domain'lerdeyse cookie'nin
//   gönderilebilmesi için production'da "none" gerekir (secure ile birlikte).
// - path: cookie yalnızca /api/auth isteklerine eklenir, diğer isteklerde taşınmaz.
// Access token ise kısa ömürlüdür ve cevap gövdesinde döner; frontend onu
// bellekte tutup Authorization header'ında gönderir.
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
