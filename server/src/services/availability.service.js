import { APPOINTMENT_STATUS, MAX_BOOKING_DAYS_AHEAD, SLOT_INTERVAL_MINUTES } from '../constants/index.js';
import { Appointment } from '../models/Appointment.js';
import { BlockedDate } from '../models/BlockedDate.js';
import { Salon } from '../models/Salon.js';
import { Service } from '../models/Service.js';
import { WorkingHours } from '../models/WorkingHours.js';
import { ApiError } from '../utils/ApiError.js';
import { addDays, getDayOfWeek, getSalonNow, minutesToTime, rangesOverlap, timeToMinutes } from '../utils/time.js';

export const SLOT_TAKEN_MESSAGE = 'Bu saat az önce başka bir müşteri tarafından alındı.';

const BLOCK_MESSAGES = {
  PAST: 'Geçmiş bir tarih veya saat için randevu oluşturulamaz.',
  TOO_FAR: `En fazla ${MAX_BOOKING_DAYS_AHEAD} gün sonrasına randevu alınabilir.`,
  CLOSED: 'Salon seçilen tarihte kapalı.',
  OUTSIDE_HOURS: 'Seçilen saat salonun çalışma saatleri dışında.',
  BREAK: 'Seçilen saat salonun mola saatine denk geliyor.',
  TAKEN: SLOT_TAKEN_MESSAGE,
};

function buildSchedule(hours, blocked) {
  if (!hours || hours.isClosed || blocked) return { closed: true };

  return {
    closed: false,
    open: timeToMinutes(hours.openTime),
    close: timeToMinutes(hours.closeTime),
    breaks: hours.breaks.map((item) => [timeToMinutes(item.start), timeToMinutes(item.end)]),
  };
}

async function getDaySchedule(salonId, date) {
  const [hours, blocked] = await Promise.all([
    WorkingHours.findOne({ salon: salonId, dayOfWeek: getDayOfWeek(date) }),
    BlockedDate.exists({ salon: salonId, date }),
  ]);
  return buildSchedule(hours, blocked);
}

async function getBusyRanges(salonId, date, excludeAppointmentId) {
  const filter = { salon: salonId, date, status: APPOINTMENT_STATUS.BOOKED };
  if (excludeAppointmentId) filter._id = { $ne: excludeAppointmentId };

  const appointments = await Appointment.find(filter).select('startTime endTime');
  return appointments.map((item) => [timeToMinutes(item.startTime), timeToMinutes(item.endTime)]);
}

function getBlockReason({ date, start, end, schedule, busy, now }) {
  if (date < now.date) return 'PAST';
  if (date > addDays(now.date, MAX_BOOKING_DAYS_AHEAD)) return 'TOO_FAR';
  if (schedule.closed) return 'CLOSED';
  if (start < schedule.open || end > schedule.close) return 'OUTSIDE_HOURS';
  if (schedule.breaks.some(([breakStart, breakEnd]) => rangesOverlap(start, end, breakStart, breakEnd))) return 'BREAK';
  if (date === now.date && start <= now.minutes) return 'PAST';
  if (busy.some(([busyStart, busyEnd]) => rangesOverlap(start, end, busyStart, busyEnd))) return 'TAKEN';
  return null;
}

function listSlots({ date, duration, schedule, busy, now }) {
  if (schedule.closed || date < now.date || date > addDays(now.date, MAX_BOOKING_DAYS_AHEAD)) return [];

  const slots = [];
  const firstStart = Math.ceil(schedule.open / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES;
  for (let start = firstStart; start + duration <= schedule.close; start += SLOT_INTERVAL_MINUTES) {
    const end = start + duration;
    slots.push({ start, end, available: getBlockReason({ date, start, end, schedule, busy, now }) === null });
  }
  return slots;
}

export async function getAvailability({ salonId, serviceId, date, excludeAppointmentId }) {
  if (!(await Salon.exists({ _id: salonId }))) throw new ApiError(404, 'Salon bulunamadı.');

  const service = await Service.findOne({ _id: serviceId, salon: salonId });
  if (!service) throw new ApiError(404, 'Hizmet bulunamadı.');

  const [schedule, busy] = await Promise.all([
    getDaySchedule(salonId, date),
    getBusyRanges(salonId, date, excludeAppointmentId),
  ]);

  const slots = listSlots({ date, duration: service.duration, schedule, busy, now: getSalonNow() });

  return {
    date,
    service: { id: service.id, name: service.name, duration: service.duration, price: service.price },
    slotInterval: SLOT_INTERVAL_MINUTES,
    isClosed: Boolean(schedule.closed),
    slots: slots.map((slot) => ({
      time: minutesToTime(slot.start),
      endTime: minutesToTime(slot.end),
      available: slot.available,
    })),
  };
}

export async function getDayLoad(salonId, date) {
  const [schedule, busy] = await Promise.all([getDaySchedule(salonId, date), getBusyRanges(salonId, date)]);
  if (schedule.closed) return { openMinutes: 0, freeSlotCount: 0 };

  const breakMinutes = schedule.breaks.reduce((total, [start, end]) => total + (end - start), 0);
  const slots = listSlots({ date, duration: SLOT_INTERVAL_MINUTES, schedule, busy, now: getSalonNow() });

  return {
    openMinutes: schedule.close - schedule.open - breakMinutes,
    freeSlotCount: slots.filter((slot) => slot.available).length,
  };
}

export async function filterSalonsWithOpenSlot(salonIds, withinDays) {
  if (salonIds.length === 0) return [];

  const now = getSalonNow();
  const dates = Array.from({ length: withinDays + 1 }, (_, index) => addDays(now.date, index));
  const inSalons = { salon: { $in: salonIds } };

  const [hours, blocked, appointments, durations] = await Promise.all([
    WorkingHours.find(inSalons),
    BlockedDate.find({ ...inSalons, date: { $in: dates } }).select('salon date'),
    Appointment.find({ ...inSalons, date: { $in: dates }, status: APPOINTMENT_STATUS.BOOKED }).select('salon date startTime endTime'),
    Service.aggregate([
      { $match: inSalons },
      { $group: { _id: '$salon', duration: { $min: '$duration' } } },
    ]),
  ]);

  const hoursByDay = new Map(hours.map((item) => [`${item.salon}:${item.dayOfWeek}`, item]));
  const blockedDays = new Set(blocked.map((item) => `${item.salon}:${item.date}`));
  const minDuration = new Map(durations.map((item) => [String(item._id), item.duration]));
  const busyByDay = new Map();
  for (const item of appointments) {
    const key = `${item.salon}:${item.date}`;
    if (!busyByDay.has(key)) busyByDay.set(key, []);
    busyByDay.get(key).push([timeToMinutes(item.startTime), timeToMinutes(item.endTime)]);
  }

  return salonIds.filter((salonId) => {
    const duration = minDuration.get(String(salonId));
    if (!duration) return false;

    return dates.some((date) => {
      const key = `${salonId}:${date}`;
      const schedule = buildSchedule(hoursByDay.get(`${salonId}:${getDayOfWeek(date)}`), blockedDays.has(key));
      const slots = listSlots({ date, duration, schedule, busy: busyByDay.get(key) ?? [], now });
      return slots.some((slot) => slot.available);
    });
  });
}

export async function assertSlotAvailable({ salonId, date, startTime, duration, excludeAppointmentId }) {
  const start = timeToMinutes(startTime);
  const end = start + duration;

  if (start % SLOT_INTERVAL_MINUTES !== 0) {
    throw new ApiError(400, `Randevu saati ${SLOT_INTERVAL_MINUTES} dakikalık dilimlere uygun olmalı (ör. 09:00, 09:30).`);
  }

  const [schedule, busy] = await Promise.all([
    getDaySchedule(salonId, date),
    getBusyRanges(salonId, date, excludeAppointmentId),
  ]);

  const reason = getBlockReason({ date, start, end, schedule, busy, now: getSalonNow() });
  if (reason) throw new ApiError(reason === 'TAKEN' ? 409 : 400, BLOCK_MESSAGES[reason]);

  return { endTime: minutesToTime(end) };
}
