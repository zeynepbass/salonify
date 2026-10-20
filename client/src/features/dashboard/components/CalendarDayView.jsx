import Icon from "@/components/atoms/Icon";
import StateMessage from "@/components/molecules/StateMessage";
import { CURRENT_TIME, TODAY } from "@/data/mock/clock";
import CalendarBlock from "@/features/dashboard/components/CalendarBlock";
import { NOW_MINUTES, SLOT_INTERVAL } from "@/features/dashboard/scheduling";
import { cn } from "@/lib/cn";
import { minutesToTime } from "@/lib/date";

const HOUR_HEIGHT = 88;
const PX_PER_MINUTE = HOUR_HEIGHT / 60;

export default function CalendarDayView({ date, bounds, range, appointments, busyRanges, selectedId, onSelect, onCreate }) {
  if (bounds.closed) {
    return (
      <StateMessage
        title="Salon bu gün kapalı."
        description="Çalışma saatlerinden veya özel kapalı günlerden değiştirebilirsin."
        className="stripes-muted [--stripe:8px]"
      />
    );
  }

  const hours = [];
  for (let minutes = range.start; minutes < range.end; minutes += 60) hours.push(minutes);

  const slots = [];
  for (let minutes = range.start; minutes < range.end; minutes += SLOT_INTERVAL) {
    const outside = minutes < bounds.start || minutes >= bounds.end;
    const onBreak = minutes >= bounds.breakRange[0] && minutes < bounds.breakRange[1];
    const past = date < TODAY || (date === TODAY && minutes < NOW_MINUTES);
    const taken = busyRanges.some(([start, end]) => minutes < end && minutes + SLOT_INTERVAL > start);
    slots.push({ minutes, time: minutesToTime(minutes), blocked: outside || onBreak, onBreak, free: !outside && !onBreak && !past && !taken, taken });
  }

  return (
    <div className="grid grid-cols-[56px_minmax(0,1fr)] border-t-2 border-ink sm:grid-cols-[64px_minmax(0,1fr)]">
      <div>
        {hours.map((minutes) => (
          <div key={minutes} className="pt-1 text-[12px] text-neutral-700" style={{ height: HOUR_HEIGHT }}>
            {minutesToTime(minutes)}
          </div>
        ))}
      </div>
      <div className="relative border-l border-line" style={{ height: (range.end - range.start) * PX_PER_MINUTE }}>
        {slots.map((slot) => (
          <button
            key={slot.minutes}
            type="button"
            disabled={!slot.free}
            aria-label={slot.blocked ? `${slot.time} bloklu` : slot.free ? `${slot.time} boş, randevu ekle` : `${slot.time} dolu`}
            onClick={() => onCreate(slot.time)}
            className={cn(
              "group absolute inset-x-0 flex items-center border-t border-line px-3 text-left text-[12px] text-neutral-700",
              slot.minutes % 60 ? "border-dashed" : "border-solid",
              slot.blocked && "stripes-muted",
              slot.free && "hover:bg-surface focus-visible:bg-surface",
            )}
            style={{ top: (slot.minutes - range.start) * PX_PER_MINUTE, height: SLOT_INTERVAL * PX_PER_MINUTE }}
          >
            {slot.blocked && (slot.onBreak ? "Mola · bloklu" : "Kapalı")}
            {slot.free && (
              <span className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Icon name="plus" size={14} />
                {slot.time} · Randevu ekle
              </span>
            )}
          </button>
        ))}

        {appointments.map((appointment) => {
          const compact = appointment.service.duration <= SLOT_INTERVAL;
          return (
            <CalendarBlock
              key={appointment.id}
              appointment={appointment}
              selected={appointment.id === selectedId}
              onSelect={onSelect}
              className={cn("inset-x-2 flex px-2.5", compact ? "items-center gap-2.5 py-0" : "flex-col gap-px py-1.5")}
              style={{
                top: (appointment.start - range.start) * PX_PER_MINUTE,
                height: Math.max(appointment.service.duration * PX_PER_MINUTE - 2, 40),
              }}
            >
              <span className="flex-none text-[12px] font-bold">
                {appointment.time}–{appointment.endTime}
              </span>
              <span className="truncate text-[14px] font-extrabold">{appointment.customer}</span>
              <span className="truncate text-[12px]">{appointment.service.name}</span>
            </CalendarBlock>
          );
        })}

        {date === TODAY && NOW_MINUTES >= range.start && NOW_MINUTES < range.end && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 -left-2 h-0.5 bg-accent"
            style={{ top: (NOW_MINUTES - range.start) * PX_PER_MINUTE }}
          >
            <span className="absolute -top-[9px] left-0 bg-accent px-1 py-0.5 text-[10px] font-extrabold text-canvas">
              {CURRENT_TIME}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
