import { z } from 'zod';
import { isValidDateString, TIME_PATTERN } from '../utils/time.js';

// Kimlikler veritabanına gitmeden önce biçim olarak doğrulanır. Geçersiz bir
// ObjectId ile sorgu atmak Mongoose'un CastError fırlatmasına yol açar;
// burada yakalayıp anlaşılır bir 400 dönüyoruz.
export const objectId = (label = 'Kimlik') => z.string(`${label} gerekli.`).regex(/^[0-9a-fA-F]{24}$/, `${label} geçersiz.`);

export const dateString = z.string('Tarih gerekli.').refine(isValidDateString, 'Tarih YYYY-AA-GG biçiminde geçerli bir tarih olmalı.');

export const timeString = z.string('Saat gerekli.').regex(TIME_PATTERN, 'Saat SS:DD biçiminde olmalı (ör. 09:30).');

export const email = z.string('E-posta gerekli.').trim().toLowerCase().pipe(z.email('Geçerli bir e-posta adresi girin.'));

export const phone = z
  .string()
  .trim()
  .max(20, 'Telefon numarası en fazla 20 karakter olabilir.')
  .regex(/^[0-9+() -]*$/, 'Telefon numarası geçersiz.');

// Görseller URL olarak saklanır. javascript: gibi şemaların img/link içinde
// çalıştırılmasını önlemek için yalnızca http(s) kabul edilir.
export const imageUrl = z
  .string('Görsel adresi gerekli.')
  .trim()
  .max(2000, 'Görsel adresi çok uzun.')
  .refine((value) => {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, 'Görsel adresi http(s) ile başlayan geçerli bir URL olmalı.');

export const text = (label, max) =>
  z.string(`${label} gerekli.`).trim().max(max, `${label} en fazla ${max} karakter olabilir.`);

export const requiredText = (label, max) => text(label, max).min(1, `${label} gerekli.`);

export const latitude = (schema) => schema.min(-90, 'Enlem -90 ile 90 arasında olmalı.').max(90, 'Enlem -90 ile 90 arasında olmalı.');
export const longitude = (schema) =>
  schema.min(-180, 'Boylam -180 ile 180 arasında olmalı.').max(180, 'Boylam -180 ile 180 arasında olmalı.');

export const coordinates = z.object({
  lat: latitude(z.number('Enlem bir sayı olmalı.')),
  lng: longitude(z.number('Boylam bir sayı olmalı.')),
});

export const booleanQuery = z.enum(['true', 'false']).transform((value) => value === 'true');

// "kesim,boya" -> ["kesim", "boya"]
export const csvList = z
  .string()
  .transform((value) => value.split(',').map((item) => item.trim()).filter(Boolean));

export function paginationQuery(maxLimit = 50, defaultLimit = 20) {
  return {
    page: z.coerce.number('Sayfa numarası geçersiz.').int().min(1, 'Sayfa numarası en az 1 olmalı.').default(1),
    limit: z.coerce
      .number('Limit geçersiz.')
      .int()
      .min(1, 'Limit en az 1 olmalı.')
      .max(maxLimit, `Limit en fazla ${maxLimit} olabilir.`)
      .default(defaultLimit),
  };
}

// PATCH isteklerinde hiçbir alan gönderilmemesi anlamlı değildir.
export const atLeastOneField = [(data) => Object.keys(data).length > 0, 'Güncellenecek en az bir alan gönderin.'];

export const salonIdParams = z.object({ salonId: objectId('Salon kimliği') });
export const appointmentIdParams = z.object({ appointmentId: objectId('Randevu kimliği') });
export const paginationOnlyQuery = z.object(paginationQuery());
