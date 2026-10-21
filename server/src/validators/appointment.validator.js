import { z } from 'zod';
import { APPOINTMENT_STATUS } from '../constants/index.js';
import {
  appointmentIdParams,
  atLeastOneField,
  dateString,
  objectId,
  paginationQuery,
  phone,
  requiredText,
  salonIdParams,
  text,
  timeString,
} from './common.js';

const statusFilter = z.enum(Object.values(APPOINTMENT_STATUS), 'Geçersiz randevu durumu.');
const notes = text('Not', 500);
const cancellationReason = text('İptal nedeni', 200);

export const availabilitySchema = {
  params: salonIdParams,
  query: z.object({
    serviceId: objectId('Hizmet kimliği'),
    date: dateString,
    excludeAppointmentId: objectId('Randevu kimliği').optional(),
  }),
};

export const bookAppointmentSchema = {
  body: z.object({
    salonId: objectId('Salon kimliği'),
    serviceId: objectId('Hizmet kimliği'),
    date: dateString,
    startTime: timeString,
    notes: notes.optional(),
  }),
};

export const listCustomerAppointmentsSchema = {
  query: z.object({
    status: statusFilter.optional(),
    scope: z.enum(['upcoming', 'past'], 'scope upcoming veya past olmalı.').optional(),
    ...paginationQuery(),
  }),
};

export const appointmentIdSchema = { params: appointmentIdParams };

export const updateCustomerAppointmentSchema = {
  params: appointmentIdParams,
  body: z
    .object({
      date: dateString.optional(),
      startTime: timeString.optional(),
      notes: notes.optional(),
    })
    .refine(...atLeastOneField),
};

export const cancelAppointmentSchema = {
  params: appointmentIdParams,
  body: z.object({ reason: cancellationReason.optional() }),
};

export const listSalonAppointmentsSchema = {
  query: z.object({
    scope: z.enum(['today', 'upcoming', 'past', 'all'], 'scope today, upcoming, past veya all olmalı.').optional(),
    search: text('Arama metni', 80).optional(),
    date: dateString.optional(),
    from: dateString.optional(),
    to: dateString.optional(),
    status: statusFilter.optional(),
    ...paginationQuery(200, 50),
  }),
};

export const createSalonAppointmentSchema = {
  body: z.object({
    customerName: requiredText('Müşteri adı', 80),
    customerPhone: phone.min(1, 'Telefon gerekli.'),
    serviceId: objectId('Hizmet kimliği'),
    date: dateString,
    startTime: timeString,
    notes: notes.optional(),
  }),
};

const SCHEDULE_FIELDS = ['serviceId', 'date', 'startTime', 'customerName', 'customerPhone', 'notes'];

export const updateSalonAppointmentSchema = {
  params: appointmentIdParams,
  body: z
    .object({
      status: z
        .enum(
          [APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.NO_SHOW, APPOINTMENT_STATUS.CANCELLED],
          'Durum yalnızca COMPLETED, NO_SHOW veya CANCELLED olabilir.',
        )
        .optional(),
      cancellationReason: cancellationReason.optional(),
      serviceId: objectId('Hizmet kimliği').optional(),
      date: dateString.optional(),
      startTime: timeString.optional(),
      customerName: requiredText('Müşteri adı', 80).optional(),
      customerPhone: phone.optional(),
      notes: notes.optional(),
    })
    .refine(...atLeastOneField)
    .refine((data) => !data.status || SCHEDULE_FIELDS.every((field) => data[field] === undefined), {
      message: 'Durum değişikliği diğer alanlarla aynı istekte gönderilemez.',
      path: ['status'],
    }),
};
