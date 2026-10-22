import { isInactiveStatus } from "@/lib/appointmentStatus";
import { CURRENT_TIME, TODAY } from "@/lib/clock";
import { WEEKDAYS, addDays, timeToMinutes } from "@/lib/date";
import { getDaySchedule } from "@/lib/schedule";

export const SLOT_INTERVAL = 30;
export const NOW_MINUTES = timeToMinutes(CURRENT_TIME);

export function toAppointmentView(appointment) {
  const start = timeToMinutes(appointment.time);
  const end = timeToMinutes(appointment.endTime);
  const booked = appointment.status === "BOOKED";
  const started = appointment.date < TODAY || (appointment.date === TODAY && start <= NOW_MINUTES);

  return {
    ...appointment,
    start,
    end,
    canComplete: booked && started,
    canEdit: booked && !started,
    locked: !booked,
    inactive: isInactiveStatus(appointment.status),
  };
}

export function getGridRange(hours) {
  const openDays = hours.filter((day) => day.open);
  if (openDays.length === 0) return { start: timeToMinutes("09:00"), end: timeToMinutes("19:00") };

  return {
    start: Math.min(...openDays.map((day) => timeToMinutes(day.start))),
    end: Math.max(...openDays.map((day) => timeToMinutes(day.end))),
  };
}

export function getDayBounds(hours, closedDays, date) {
  const schedule = getDaySchedule(hours, closedDays, date);
  if (schedule.closed) return { closed: true, start: 0, end: 0, breakRange: [0, 0] };

  const hasBreak = Boolean(schedule.breakStart && schedule.breakEnd);
  return {
    closed: false,
    start: timeToMinutes(schedule.start),
    end: timeToMinutes(schedule.end),
    breakRange: hasBreak ? [timeToMinutes(schedule.breakStart), timeToMinutes(schedule.breakEnd)] : [0, 0],
  };
}

export function getBusyRanges(appointments, date, exceptId) {
  return appointments
    .filter((item) => item.date === date && item.id !== exceptId && item.status === "BOOKED")
    .map((item) => [timeToMinutes(item.time), timeToMinutes(item.endTime)]);
}

export function getOpenDates(hours, closedDays, count) {
  const dates = [];
  for (let offset = 0; dates.length < count && offset < count * 2; offset += 1) {
    const date = addDays(TODAY, offset);
    if (!getDaySchedule(hours, closedDays, date).closed) dates.push(date);
  }
  return dates;
}

export function validateHours(hours) {
  for (const day of hours) {
    if (!day.open) continue;
    const name = WEEKDAYS[day.weekday];
    if (!day.start || !day.end) return `${name} için açılış ve kapanış saati gerekli.`;
    if (timeToMinutes(day.start) >= timeToMinutes(day.end)) return `${name}: kapanış saati açılıştan sonra olmalı.`;
    if (Boolean(day.breakStart) !== Boolean(day.breakEnd)) return `${name}: mola için başlangıç ve bitiş birlikte girilmeli.`;
    if (day.breakStart) {
      const [breakStart, breakEnd] = [timeToMinutes(day.breakStart), timeToMinutes(day.breakEnd)];
      if (breakStart >= breakEnd) return `${name}: mola bitişi başlangıçtan sonra olmalı.`;
      if (breakStart < timeToMinutes(day.start) || breakEnd > timeToMinutes(day.end)) {
        return `${name}: mola çalışma saatleri içinde olmalı.`;
      }
    }
  }
  return null;
}
