import { createHash, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// İmza algoritmasını hem üretirken hem doğrularken sabitliyoruz. Doğrulamada
// algoritma belirtilmezse saldırgan token başlığındaki "alg" alanını
// değiştirerek imza kontrolünü atlatmayı deneyebilir.
const ALGORITHM = 'HS256';

// Access token'da yalnızca kullanıcı kimliği taşınır. Rol bilgisi token'a
// yazılmaz; her istekte veritabanından okunur. Böylece yetki kararı her
// zaman güncel ve sunucunun kontrolündeki veriye dayanır.
export function signAccessToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.jwtSecret, { algorithm: ALGORITHM, expiresIn: env.accessTokenTtl });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret, { algorithms: [ALGORITHM] });
}

// jti her token'ı benzersiz kılar; aynı saniyede üretilen iki refresh token
// bile farklı olur ve tek tek iptal edilebilir.
export function signRefreshToken(userId) {
  return jwt.sign({ sub: String(userId), jti: randomUUID() }, env.jwtRefreshSecret, {
    algorithm: ALGORITHM,
    expiresIn: `${env.refreshTokenTtlDays}d`,
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret, { algorithms: [ALGORITHM] });
}

// Refresh token veritabanında düz metin olarak saklanmaz. Veritabanı
// sızsa bile hash'ten geçerli bir token üretilemez.
export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
