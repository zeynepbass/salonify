import { z } from 'zod';
import { atLeastOneField, imageUrl, objectId, text } from './common.js';

const fields = {
  image: imageUrl,
  title: text('Başlık', 120),
  description: text('Açıklama', 500),
  isPublished: z.boolean('isPublished true veya false olmalı.'),
};

export const portfolioItemIdParams = z.object({ itemId: objectId('Portföy kimliği') });

export const createPortfolioSchema = {
  body: z.object({
    image: fields.image,
    title: fields.title.optional(),
    description: fields.description.optional(),
    isPublished: fields.isPublished.optional(),
  }),
};

export const updatePortfolioSchema = {
  params: portfolioItemIdParams,
  body: z.object(fields).partial().refine(...atLeastOneField),
};
