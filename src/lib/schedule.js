import { getDateParts, timeToMinutes } from "@/lib/date";

export function getDaySchedule(hours, closedDays, date) {
  const schedule = hours.find((day) => day.weekday === getDateParts(date).weekdayIndex);
  const closed = !schedule.open || closedDays.some((day) => day.date === date);
  return { ...schedule, closed };
}

export function getOpeningStatus(hours, closedDays, date, time) {
  const schedule = getDaySchedule(hours, closedDays, date);
  const now = timeToMinutes(time);
  const open = !schedule.closed && now >= timeToMinutes(schedule.start) && now < timeToMinutes(schedule.end);

  if (open) return { open, label: `Şu an açık · Kapanış ${schedule.end}` };
  if (!schedule.closed && now < timeToMinutes(schedule.start)) return { open, label: `Şu an kapalı · Açılış ${schedule.start}` };
  return { open, label: "Şu an kapalı" };
}
