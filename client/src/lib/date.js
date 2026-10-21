export const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const MONTHS_SHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export const WEEKDAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

export const WEEKDAYS_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const pad = (value) => String(value).padStart(2, "0");

function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseISODate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(iso, amount) {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + amount);
  return toISODate(date);
}

export function startOfWeek(iso) {
  const date = parseISODate(iso);
  return addDays(iso, -((date.getDay() + 6) % 7));
}

export function getDateParts(iso) {
  const date = parseISODate(iso);
  return {
    day: date.getDate(),
    month: MONTHS[date.getMonth()],
    monthShort: MONTHS_SHORT[date.getMonth()],
    year: date.getFullYear(),
    weekday: WEEKDAYS[date.getDay()],
    weekdayShort: WEEKDAYS_SHORT[date.getDay()],
    weekdayIndex: date.getDay(),
  };
}

export function formatLongDate(iso, { withWeekday = false } = {}) {
  const { day, month, year, weekday } = getDateParts(iso);
  return withWeekday ? `${day} ${month} ${year}, ${weekday}` : `${day} ${month} ${year}`;
}

export function formatDayMonth(iso) {
  const { day, month } = getDateParts(iso);
  return `${day} ${month}`;
}

export function formatDayWithWeekday(iso) {
  const { day, month, weekday } = getDateParts(iso);
  return `${day} ${month} ${weekday}`;
}

export function formatShortDate(iso) {
  const { day, monthShort, weekdayShort } = getDateParts(iso);
  return `${day} ${monthShort} ${weekdayShort}`;
}

export function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(total) {
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function getMonthGrid(year, monthIndex) {
  const leading = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();
  const days = Array.from({ length: dayCount }, (_, index) => toISODate(new Date(year, monthIndex, index + 1)));
  return { leading, days };
}

export function formatRelativeTime(isoDateTime, now = new Date()) {
  const date = new Date(isoDateTime);
  const minutes = Math.floor((now - date) / 60000);

  if (minutes < 1) return "Şimdi";
  if (minutes < 60) return `${minutes} dk önce`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} saat önce`;

  const days = Math.floor(minutes / (24 * 60));
  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

export function formatMonthYear(isoDateTime) {
  const date = new Date(isoDateTime);
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
