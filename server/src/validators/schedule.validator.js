import { z } from 'zod';
import { rangesOverlap, timeToMinutes } from '../utils/time.js';
import { dateString, objectId, text, timeString } from './common.js';

const breakSchema = z.object({ start: timeString, end: timeString });

const daySchema = z
  .object({
    dayOfWeek: z.number('Gün 0-6 arasında olmalı.').int().min(0, 'Gün 0-6 arasında olmalı.').max(6, 'Gün 0-6 arasında olmalı.'),
    openTime: timeString,
    closeTime: timeString,
    breaks: z.array(breakSchema).max(5, 'Bir güne en fazla 5 mola eklenebilir.').default([]),
    isClosed: z.boolean().default(false),
  })
  .superRefine((day, ctx) => {
    const open = timeToMinutes(day.openTime);
    const close = timeToMinutes(day.closeTime);
    if (open >= close) {
      ctx.addIssue({ code: 'custom', path: ['closeTime'], message: 'Kapanış saati açılış saatinden sonra olmalı.' });
      return;
    }

    const ranges = day.breaks.map((item) => [timeToMinutes(item.start), timeToMinutes(item.end)]);
    ranges.forEach(([start, end], index) => {
      if (start >= end) {
        ctx.addIssue({ code: 'custom', path: ['breaks', index], message: 'Mola bitişi başlangıcından sonra olmalı.' });
      } else if (start < open || end > close) {
        ctx.addIssue({ code: 'custom', path: ['breaks', index], message: 'Mola çalışma saatleri içinde olmalı.' });
      } else if (ranges.some(([otherStart, otherEnd], other) => other < index && rangesOverlap(start, end, otherStart, otherEnd))) {
        ctx.addIssue({ code: 'custom', path: ['breaks', index], message: 'Molalar birbiriyle çakışamaz.' });
      }
    });
  });

export const updateWorkingHoursSchema = {
  body: z.object({
    days: z
      .array(daySchema, 'Güncellenecek günleri "days" dizisinde gönderin.')
      .min(1, 'En az bir gün gönderin.')
      .max(7, 'En fazla 7 gün gönderilebilir.')
      .refine((days) => new Set(days.map((day) => day.dayOfWeek)).size === days.length, 'Aynı gün birden fazla kez gönderilemez.'),
  }),
};

export const createBlockedDateSchema = {
  body: z.object({
    date: dateString,
    note: text('Açıklama', 200).optional(),
  }),
};

export const blockedDateIdSchema = {
  params: z.object({ id: objectId('Kapalı gün kimliği') }),
};
