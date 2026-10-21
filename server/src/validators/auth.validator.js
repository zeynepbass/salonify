import { z } from 'zod';
import { ROLES } from '../constants/index.js';
import { coordinates, email, phone, requiredText, text } from './common.js';

export const password = z
  .string('Şifre gerekli.')
  .min(8, 'Şifre en az 8 karakter olmalı.')
  .max(72, 'Şifre en fazla 72 karakter olabilir.');

const salonDetails = z.object({
  name: requiredText('Salon adı', 120),
  city: requiredText('Şehir', 60),
  district: requiredText('İlçe', 60),
  neighborhood: text('Mahalle', 60).optional(),
  address: text('Adres', 300).optional(),
  phone: phone.optional(),
  coordinates: coordinates.optional(),
});

export const registerSchema = {
  body: z
    .object({
      name: requiredText('Ad soyad', 80),
      email,
      password,
      phone: phone.optional(),
      role: z.enum([ROLES.CUSTOMER, ROLES.SALON], 'Hesap türü CUSTOMER veya SALON olmalı.').default(ROLES.CUSTOMER),
      salon: salonDetails.optional(),
    })
    .refine((data) => data.role !== ROLES.SALON || data.salon, {
      message: 'Salon hesabı için salon bilgileri gerekli.',
      path: ['salon'],
    }),
};

export const loginSchema = {
  body: z.object({
    email,
    password: z.string('Şifre gerekli.').min(1, 'Şifre gerekli.').max(72, 'E-posta veya şifre hatalı.'),
  }),
};
