import { z } from 'zod';
import { MAX_REVIEW_PHOTOS } from '../constants/index.js';
import { appointmentIdParams, imageUrl, text } from './common.js';

export const createReviewSchema = {
  params: appointmentIdParams,
  body: z.object({
    rating: z
      .number('Puan gerekli.')
      .int('Puan 1 ile 5 arasında bir tam sayı olmalı.')
      .min(1, 'Puan 1 ile 5 arasında olmalı.')
      .max(5, 'Puan 1 ile 5 arasında olmalı.'),
    comment: text('Yorum', 1000).optional(),
    // Fotoğraflar önce POST /api/uploads ile yüklenir, burada adresleri gönderilir.
    hairPhotos: z.array(imageUrl).max(MAX_REVIEW_PHOTOS, `En fazla ${MAX_REVIEW_PHOTOS} fotoğraf eklenebilir.`).optional(),
    // Tek fotoğraf gönderen istemciler için kısa yol.
    hairPhoto: imageUrl.optional(),
    // Paylaşım izni varsayılan olarak kapalıdır; müşteri açıkça true
    // göndermedikçe değerlendirme özel kalır.
    isPublic: z.boolean('isPublic true veya false olmalı.').default(false),
  }),
};
