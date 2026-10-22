import { getDateParts } from "@/lib/date";

export default function DateBadge({ date }) {
  const { day, monthShort, weekdayShort } = getDateParts(date);

  return (
    <div className="w-[72px] flex-none overflow-hidden rounded-lg border border-line bg-canvas pb-2 text-center leading-[1.1] shadow-sm">
      <div className="mb-1 bg-accent py-1 text-[11px] font-bold tracking-[0.08em] text-canvas uppercase">{monthShort}</div>
      <div className="text-[28px] font-extrabold">{day}</div>
      <div className="text-[11px] text-neutral-700">{weekdayShort}</div>
    </div>
  );
}
