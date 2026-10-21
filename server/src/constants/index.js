export const ROLES = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  SALON: 'SALON',
});

export const APPOINTMENT_STATUS = Object.freeze({
  BOOKED: 'BOOKED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
});

export const APPOINTMENT_SOURCE = Object.freeze({
  ONLINE: 'ONLINE',
  MANUAL: 'MANUAL',
});

export const NOTIFICATION_TYPES = Object.freeze({
  APPOINTMENT_CREATED: 'APPOINTMENT_CREATED',
  APPOINTMENT_UPDATED: 'APPOINTMENT_UPDATED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
  APPOINTMENT_COMPLETED: 'APPOINTMENT_COMPLETED',
  REVIEW_REQUESTED: 'REVIEW_REQUESTED',
  REVIEW_PUBLISHED: 'REVIEW_PUBLISHED',
});

export const PORTFOLIO_SOURCE = Object.freeze({
  SALON: 'SALON',
  REVIEW: 'REVIEW',
});

export const SERVICE_CATEGORIES = Object.freeze(['kesim', 'boya', 'balayage', 'ombre', 'rofle', 'fon', 'gelin', 'diger']);

export const SLOT_INTERVAL_MINUTES = 30;

export const MAX_BOOKING_DAYS_AHEAD = 90;

export const MAX_REVIEW_PHOTOS = 4;

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_MIME_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp']);

export const SALON_TIMEZONE = 'Europe/Istanbul';

export const DEFAULT_WORKING_HOURS = Object.freeze(
  [1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => ({
    dayOfWeek,
    openTime: '09:00',
    closeTime: '19:00',
    breaks: [{ start: '12:00', end: '13:00' }],
    isClosed: dayOfWeek === 0,
  })),
);
