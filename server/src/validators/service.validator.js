import { z } from 'zod';
import { SERVICE_CATEGORIES } from '../constants/index.js';
import { atLeastOneField, objectId, requiredText, text } from './common.js';

const fields = {
  name: requiredText('Hizmet adı', 80),
  description: text('Açıklama', 500),
  category: z.enum(SERVICE_CATEGORIES, 'Geçersiz kategori.'),
  duration: z
    .number('Süre dakika cinsinden bir sayı olmalı.')
    .int('Süre tam sayı olmalı.')
    .min(5, 'Süre en az 5 dakika olmalı.')
    .max(600, 'Süre en fazla 600 dakika olabilir.'),
  price: z.number('Fiyat bir sayı olmalı.').min(0, 'Fiyat negatif olamaz.').max(1_000_000, 'Fiyat çok yüksek.'),
  isActive: z.boolean('isActive true veya false olmalı.'),
};

export const serviceIdParams = z.object({ serviceId: objectId('Hizmet kimliği') });

export const createServiceSchema = {
  body: z.object({
    name: fields.name,
    duration: fields.duration,
    price: fields.price,
    description: fields.description.optional(),
    category: fields.category.optional(),
    isActive: fields.isActive.optional(),
  }),
};

export const updateServiceSchema = {
  params: serviceIdParams,
  body: z.object(fields).partial().refine(...atLeastOneField),
};
