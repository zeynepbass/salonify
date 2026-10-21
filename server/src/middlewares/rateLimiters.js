import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const WINDOW_MS = 15 * 60 * 1000;

function createLimiter(limit, message) {
  return rateLimit({
    windowMs: WINDOW_MS,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => env.isTest,
    message: { success: false, message },
  });
}

export const apiLimiter = createLimiter(600, 'Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin.');

export const uploadLimiter = createLimiter(60, 'Çok fazla dosya yüklendi. Lütfen biraz sonra tekrar deneyin.');

export const authLimiter = createLimiter(20, 'Çok fazla deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.');
