import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import { cn } from "@/lib/cn";
import { MONTHS, WEEKDAYS_SHORT, WEEK_ORDER, getDateParts, getMonthGrid } from "@/lib/date";

function Legend() {
  return (
    <div className="mt-3.5 flex flex-wrap gap-4 text-[12px] text-neutral-700">
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm border border-neutral-400" />
        Bugün
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm bg-accent" />
        Seçili
      </span>
      <span className="flex items-center gap-1.5">
        <span className="line-through">15</span>
        Kapalı / geçmiş
      </span>
    </div>
  );
}

export default function DatePicker({ year, monthIndex, value, getAvailability, onChange, onPrevious, onNext }) {
  const { leading, days } = getMonthGrid(year, monthIndex);
  const title = `${MONTHS[monthIndex]} ${year}`;

  return (
    <div className="rounded-xl bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <strong className="text-[17px]">{title}</strong>
        <div className="flex gap-1">
          <Button size="icon" aria-label="Önceki ay" disabled={!onPrevious} onClick={onPrevious}>
            <Icon name="chevronLeft" />
          </Button>
          <Button size="icon" aria-label="Sonraki ay" disabled={!onNext} onClick={onNext}>
            <Icon name="chevronRight" />
          </Button>
        </div>
      </div>

      <div role="group" aria-label={title} className="grid grid-cols-7 gap-1">
        {WEEK_ORDER.map((weekday) => (
          <div key={weekday} className="eyebrow py-1.5 text-center font-normal text-neutral-700">
            {WEEKDAYS_SHORT[weekday]}
          </div>
        ))}
        {Array.from({ length: leading }, (_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {days.map((date) => {
          const { day } = getDateParts(date);
          const { past, closed, today, selectable } = getAvailability(date);
          const selected = date === value;
          const note = closed && !past ? "Kapalı" : today ? "Bugün" : "";

          return (
            <button
              key={date}
              type="button"
              disabled={!selectable}
              aria-pressed={selected}
              aria-label={`${day} ${MONTHS[monthIndex]}${closed ? ", kapalı" : past ? ", geçmiş" : ""}`}
              onClick={() => onChange(date)}
              className={cn(
                "flex h-12 flex-col items-center justify-center gap-px rounded-md border text-[15px] transition-colors",
                selectable && "hover:border-accent-400",
                selected && "border-accent bg-accent font-extrabold text-canvas hover:border-accent",
                !selected && selectable && "border-transparent bg-canvas font-medium",
                !selected && today && "border border-neutral-400 font-extrabold",
                !selectable && "cursor-not-allowed border-transparent text-neutral-500",
              )}
            >
              <span className={cn(!selectable && "line-through")}>{day}</span>
              {note && <span className="text-[9px] tracking-[0.04em] uppercase">{note}</span>}
            </button>
          );
        })}
      </div>
      <Legend />
    </div>
  );
}
