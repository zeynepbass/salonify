import { SALON_TIMEZONE, SLOT_INTERVAL_MINUTES } from '../constants/index.js';

export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const pad = (value) => String(value).padStart(2, '0');

export function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes) {
  return `${pad(Math.floor(totalMinutes / 60))}:${pad(totalMinutes % 60)}`;
}

// "2026-02-31" gibi biçimi doğru ama takvimde olmayan tarihleri de eler.
export function isValidDateString(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Tarihler saat dilimsiz "YYYY-MM-DD" olarak tutulduğu için gün hesabını
// UTC üzerinden yapıyoruz; böylece sunucunun saat dilimi sonucu etkilemez.
export function getDayOfWeek(date) {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function addDays(date, amount) {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + amount);
  return result.toISOString().slice(0, 10);
}

// Pazartesi-Pazar haftası.
export function getWeekRange(date) {
  const from = addDays(date, -((getDayOfWeek(date) + 6) % 7));
  return { from, to: addDays(from, 6) };
}

const nowFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SALON_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

// Salonun saat dilimine göre "şu an". Sunucu UTC'de çalışsa bile gece
// 01:00'de İstanbul'daki bir salon için "bugün" doğru hesaplanır.
export function getSalonNow(instant = new Date()) {
  const parts = Object.fromEntries(nowFormatter.formatToParts(instant).map((part) => [part.type, part.value]));
  const time = `${parts.hour}:${parts.minute}`;
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time, minutes: timeToMinutes(time) };
}

// Bir randevunun başlangıç saati geçti mi?
export function hasStarted({ date, startTime }, now = getSalonNow()) {
  return date < now.date || (date === now.date && timeToMinutes(startTime) <= now.minutes);
}

// Yarı açık aralıklar [start, end): 10:00'da biten randevu ile 10:00'da
// başlayan randevu çakışmaz.
export function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

// Randevunun kapladığı zaman dilimlerinin anahtarları. 09:00-09:45 arası bir
// randevu ["09:00", "09:30"] dilimlerini kaplar. Bu liste Appointment
// üzerindeki unique index'in çakışmayı yakalamasını sağlar.
export function buildSlotKeys(startMinutes, endMinutes) {
  const keys = [];
  const first = Math.floor(startMinutes / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES;
  for (let minutes = first; minutes < endMinutes; minutes += SLOT_INTERVAL_MINUTES) {
    keys.push(minutesToTime(minutes));
  }
  return keys;
}

const dayMonthFormatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', timeZone: 'UTC' });

// "2026-10-09" -> "9 Ekim" (bildirim metinleri için).
export function formatDayMonth(date) {
  return dayMonthFormatter.format(new Date(`${date}T00:00:00Z`));
}

// Türkçe büyük/küçük harf kuralıyla (İ/i, I/ı) aramaya uygun hale getirir.
export function normalizeText(value) {
  return String(value ?? '').toLocaleLowerCase('tr-TR').trim();
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
