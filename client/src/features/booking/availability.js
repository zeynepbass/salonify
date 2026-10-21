import { TODAY } from "@/lib/clock";
import { addDays, parseISODate } from "@/lib/date";
import { getDaySchedule } from "@/lib/schedule";

export const SLOT_INTERVAL = 30;
export const BOOKING_MONTHS = 3;
export const MAX_BOOKING_DAYS_AHEAD = 90;

const LAST_BOOKABLE_DATE = addDays(TODAY, MAX_BOOKING_DAYS_AHEAD);

export function getBookingMonth(offset) {
  const today = parseISODate(TODAY);
  const date = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  return { year: date.getFullYear(), monthIndex: date.getMonth() };
}

export function createDayAvailability(hours, closedDays) {
  return (date) => {
    const past = date < TODAY || date > LAST_BOOKABLE_DATE;
    const closed = getDaySchedule(hours, closedDays, date).closed;
    return { past, closed, today: date === TODAY, selectable: !past && !closed };
  };
}
