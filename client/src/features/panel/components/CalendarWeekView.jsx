import CalendarBlock from "@/features/panel/components/CalendarBlock";
import { cn } from "@/lib/cn";
import { getDateParts, minutesToTime } from "@/lib/date";

const HOUR_HEIGHT = 66;
const PX_PER_MINUTE = HOUR_HEIGHT / 60;

export default function CalendarWeekView({ days, range, today, selectedId, onSelect, onOpenDay }) {
  const hours = [];
  for (let minutes = range.start; minutes < range.end; minutes += 60) hours.push(minutes);

  return (
    <div className="overflow-x-auto border-t-2 border-ink">
      <div className="grid min-w-[880px] grid-cols-[56px_repeat(7,minmax(0,1fr))]">
        <div />
        {days.map((day) => {
          const { day: dayNumber, weekdayShort } = getDateParts(day.date);
          const isToday = day.date === today;
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onOpenDay(day.date)}
              className={cn(
                "border-b-2 border-l border-line px-2 py-2.5 text-left transition-colors",
                isToday ? "bg-ink text-canvas" : "hover:bg-surface",
              )}
            >
              <div className="eyebrow font-normal">{weekdayShort}</div>
              <div className="text-[20px] font-extrabold">{dayNumber}</div>
              <div className="text-[11px]">{day.closed ? "Kapalı" : `${day.activeCount} randevu`}</div>
            </button>
          );
        })}

        <div>
          {hours.map((minutes) => (
            <div key={minutes} className="pt-1 text-[11px] text-neutral-700" style={{ height: HOUR_HEIGHT }}>
              {minutesToTime(minutes)}
            </div>
          ))}
        </div>
        {days.map((day) => (
          <div
            key={day.date}
            className={cn("relative border-l border-line", day.closed && "stripes-muted")}
            style={{ height: (range.end - range.start) * PX_PER_MINUTE }}
          >
            {day.closed && <span className="absolute top-3 left-2 text-[12px] font-bold">Kapalı</span>}
            {day.appointments.map((appointment) => (
              <CalendarBlock
                key={appointment.id}
                appointment={appointment}
                selected={appointment.id === selectedId}
                onSelect={onSelect}
                className="inset-x-[3px] px-1.5 py-[3px] text-[11px] leading-tight"
                style={{
                  top: (appointment.start - range.start) * PX_PER_MINUTE,
                  height: Math.max(appointment.service.duration * PX_PER_MINUTE - 2, 18),
                }}
              >
                <strong>{appointment.time}</strong> {appointment.customer}
                <br />
                {appointment.service.name}
              </CalendarBlock>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
