import { z } from 'zod';
import { SERVICE_CATEGORIES } from '../constants/index.js';
import {
  atLeastOneField,
  coordinates,
  csvList,
  email,
  imageUrl,
  latitude,
  longitude,
  paginationQuery,
  phone,
  requiredText,
  text,
} from './common.js';

export const listSalonsSchema = {
  query: z
    .object({
      search: text('Arama metni', 80).optional(),
      city: text('Şehir', 60).optional(),
      district: text('İlçe', 60).optional(),
      category: csvList
        .refine((items) => items.every((item) => SERVICE_CATEGORIES.includes(item)), 'Geçersiz kategori.')
        .optional(),
      hairStyle: csvList.optional(),
      rating: z.coerce.number('Puan filtresi geçersiz.').min(0, 'Puan 0-5 arasında olmalı.').max(5, 'Puan 0-5 arasında olmalı.').optional(),
      lat: latitude(z.coerce.number('Enlem geçersiz.')).optional(),
      lng: longitude(z.coerce.number('Boylam geçersiz.')).optional(),
      distance: z.coerce.number('Mesafe geçersiz.').positive('Mesafe 0\'dan büyük olmalı.').max(100, 'Mesafe en fazla 100 km olabilir.').optional(),
      availability: z.enum(['today', 'tomorrow', 'week'], 'Uygunluk today, tomorrow veya week olmalı.').optional(),
      sort: z.enum(['rating', 'popular', 'price', 'newest', 'nearest'], 'Geçersiz sıralama.').default('rating'),
      ...paginationQuery(),
    })
    .refine((query) => (query.lat === undefined) === (query.lng === undefined), {
      message: 'Konum için lat ve lng birlikte gönderilmeli.',
      path: ['lat'],
    })
    .refine((query) => (!query.distance && query.sort !== 'nearest') || query.lat !== undefined, {
      message: 'Mesafe filtresi ve "en yakın" sıralaması için konum (lat, lng) gerekli.',
      path: ['lat'],
    }),
};

export const updateSalonSchema = {
  body: z
    .object({
      name: requiredText('Salon adı', 120).optional(),
      description: text('Açıklama', 2000).optional(),
      email: email.optional(),
      phone: phone.optional(),
      address: text('Adres', 300).optional(),
      city: requiredText('Şehir', 60).optional(),
      district: requiredText('İlçe', 60).optional(),
      neighborhood: text('Mahalle', 60).optional(),
      audience: text('Hedef kitle', 60).optional(),
      hairStyles: z.array(requiredText('Saç stili', 40)).max(20, 'En fazla 20 saç stili eklenebilir.').optional(),
      coverImage: imageUrl.optional(),
      coordinates: coordinates.nullable().optional(),
    })
    .refine(...atLeastOneField),
};
