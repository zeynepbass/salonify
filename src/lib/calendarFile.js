import { minutesToTime, timeToMinutes } from "@/lib/date";

const stamp = (date, time) => `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;

export function downloadCalendarEvent({ reference, title, location, date, time, duration }) {
  const end = minutesToTime(timeToMinutes(time) + duration);
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SalonaBOX//Randevu//TR",
    "BEGIN:VEVENT",
    `UID:${reference}@salonabox`,
    `DTSTART;TZID=Europe/Istanbul:${stamp(date, time)}`,
    `DTEND;TZID=Europe/Istanbul:${stamp(date, end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${reference}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
