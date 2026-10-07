import { getDateParts } from "@/lib/date";

export default function DateBadge({ date }) {
  const { day, monthShort, weekdayShort } = getDateParts(date);

  return (
    <div className="w-[72px] flex-none border-2 border-ink py-2 text-center leading-[1.1]">
      <div className="text-[11px] font-bold tracking-[0.08em] uppercase">{monthShort}</div>
      <div className="text-[28px] font-extrabold">{day}</div>
      <div className="text-[11px] text-neutral-700">{weekdayShort}</div>
    </div>
  );
}
