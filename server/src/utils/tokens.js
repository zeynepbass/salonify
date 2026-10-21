import { createHash, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const ALGORITHM = 'HS256';

export function signAccessToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.jwtSecret, { algorithm: ALGORITHM, expiresIn: env.accessTokenTtl });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret, { algorithms: [ALGORITHM] });
}

export function signRefreshToken(userId) {
  return jwt.sign({ sub: String(userId), jti: randomUUID() }, env.jwtRefreshSecret, {
    algorithm: ALGORITHM,
    expiresIn: `${env.refreshTokenTtlDays}d`,
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret, { algorithms: [ALGORITHM] });
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
