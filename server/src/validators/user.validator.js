import { z } from 'zod';
import { password } from './auth.validator.js';
import { atLeastOneField, email, phone, requiredText, text } from './common.js';

export const updateProfileSchema = {
  body: z
    .object({
      name: requiredText('Ad soyad', 80).optional(),
      email: email.optional(),
      phone: phone.optional(),
      notificationPreferences: z
        .object({
          email: z.boolean().optional(),
          sms: z.boolean().optional(),
          reminder: z.boolean().optional(),
          promo: z.boolean().optional(),
        })
        .optional(),
      location: z.object({ city: text('Şehir', 60).optional(), district: text('İlçe', 60).optional() }).optional(),
    })
    .refine(...atLeastOneField),
};

const currentPassword = z.string('Mevcut şifre gerekli.').min(1, 'Mevcut şifre gerekli.').max(72, 'Mevcut şifre hatalı.');

export const changePasswordSchema = {
  body: z
    .object({ currentPassword, newPassword: password })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'Yeni şifre mevcut şifreden farklı olmalı.',
      path: ['newPassword'],
    }),
};

export const deleteAccountSchema = {
  body: z.object({ password: currentPassword }),
};
