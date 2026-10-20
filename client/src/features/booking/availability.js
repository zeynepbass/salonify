import { CURRENT_TIME, TODAY } from "@/data/mock/clock";
import { closedDays, workingHours } from "@/data/mock/workingHours";
import { getDaySchedule } from "@/lib/schedule";
import { getDateParts, minutesToTime, parseISODate, timeToMinutes } from "@/lib/date";

export const SLOT_INTERVAL = 30;
export const BOOKING_MONTHS = 2;

export function getBookingMonth(offset) {
  const today = parseISODate(TODAY);
  const date = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  return { year: date.getFullYear(), monthIndex: date.getMonth() };
}

export function getDayAvailability(date) {
  const past = date < TODAY;
  const closed = getDaySchedule(workingHours, closedDays, date).closed;
  return { past, closed, today: date === TODAY, selectable: !past && !closed };
}

function isOccupied(day, index) {
  return (day * 3 + index * 5) % 7 === 0 || (day + index) % 6 === 0;
}

export function getSlots(date, takenTimes = []) {
  const schedule = getDaySchedule(workingHours, closedDays, date);
  if (schedule.closed) return [];

  const { day } = getDateParts(date);
  const start = timeToMinutes(schedule.start);
  const end = timeToMinutes(schedule.end);
  const now = date === TODAY ? timeToMinutes(CURRENT_TIME) : -1;
  const slots = [];

  for (let minutes = start, index = 0; minutes < end; minutes += SLOT_INTERVAL, index += 1) {
    const time = minutesToTime(minutes);
    slots.push({ time, available: minutes > now && !isOccupied(day, index) && !takenTimes.includes(time) });
  }

  return slots;
}
