import { CURRENT_TIME, TODAY } from "@/data/mock/clock";
import { isInactiveStatus } from "@/lib/appointmentStatus";
import { getService } from "@/lib/catalog";
import { addDays, minutesToTime, timeToMinutes } from "@/lib/date";
import { getDaySchedule } from "@/lib/schedule";

export const SLOT_INTERVAL = 30;
export const NOW_MINUTES = timeToMinutes(CURRENT_TIME);

const overlaps = (start, end, [rangeStart, rangeEnd]) => start < rangeEnd && end > rangeStart;

export function toAppointmentView(appointment, services) {
  const service = getService(appointment.serviceId, services);
  const start = timeToMinutes(appointment.time);
  const end = start + service.duration;
  const booked = appointment.status === "BOOKED";
  const started = appointment.date < TODAY || (appointment.date === TODAY && start <= NOW_MINUTES);

  return {
    ...appointment,
    service,
    start,
    end,
    endTime: minutesToTime(end),
    canComplete: booked && started,
    canEdit: booked && !started,
    locked: !booked,
    inactive: isInactiveStatus(appointment.status),
  };
}

export function getGridRange(hours) {
  const openDays = hours.filter((day) => day.open);
  return {
    start: Math.min(...openDays.map((day) => timeToMinutes(day.start))),
    end: Math.max(...openDays.map((day) => timeToMinutes(day.end))),
  };
}

export function getDayBounds(hours, closedDays, date) {
  const schedule = getDaySchedule(hours, closedDays, date);
  return {
    closed: schedule.closed,
    start: timeToMinutes(schedule.start),
    end: timeToMinutes(schedule.end),
    breakRange: [timeToMinutes(schedule.breakStart), timeToMinutes(schedule.breakEnd)],
  };
}

export function getBusyRanges(appointments, services, date, exceptId) {
  return appointments
    .filter((item) => item.date === date && item.id !== exceptId && item.status !== "CANCELLED")
    .map((item) => {
      const start = timeToMinutes(item.time);
      return [start, start + getService(item.serviceId, services).duration];
    });
}

export function getFreeStarts({ date, duration, hours, closedDays, appointments, services, exceptId }) {
  const bounds = getDayBounds(hours, closedDays, date);
  if (bounds.closed || date < TODAY) return [];

  const busy = getBusyRanges(appointments, services, date, exceptId);
  const starts = [];

  for (let start = bounds.start; start + duration <= bounds.end; start += SLOT_INTERVAL) {
    const end = start + duration;
    const past = date === TODAY && start <= NOW_MINUTES;
    const blocked = overlaps(start, end, bounds.breakRange) || busy.some((range) => overlaps(start, end, range));
    if (!past && !blocked) starts.push(minutesToTime(start));
  }

  return starts;
}

export function getOpenDates(hours, closedDays, count) {
  const dates = [];
  for (let offset = 0; dates.length < count && offset < count * 2; offset += 1) {
    const date = addDays(TODAY, offset);
    if (!getDaySchedule(hours, closedDays, date).closed) dates.push(date);
  }
  return dates;
}
