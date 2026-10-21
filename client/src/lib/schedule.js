import { WEEK_ORDER, getDateParts, timeToMinutes } from "@/lib/date";

export function toWorkingHours(days) {
  return WEEK_ORDER.map((weekday) => {
    const day = days.find((item) => item.dayOfWeek === weekday);
    const [firstBreak] = day?.breaks ?? [];
    return {
      weekday,
      open: Boolean(day && !day.isClosed),
      start: day?.openTime ?? "09:00",
      end: day?.closeTime ?? "19:00",
      breakStart: firstBreak?.start ?? "",
      breakEnd: firstBreak?.end ?? "",
    };
  });
}

export function toWorkingHoursPayload(hours) {
  return hours.map((day) => ({
    dayOfWeek: day.weekday,
    openTime: day.start,
    closeTime: day.end,
    breaks: day.breakStart && day.breakEnd ? [{ start: day.breakStart, end: day.breakEnd }] : [],
    isClosed: !day.open,
  }));
}

export function getDaySchedule(hours, closedDays, date) {
  const schedule = hours.find((day) => day.weekday === getDateParts(date).weekdayIndex);
  const closed = !schedule?.open || closedDays.some((day) => day.date === date);
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
