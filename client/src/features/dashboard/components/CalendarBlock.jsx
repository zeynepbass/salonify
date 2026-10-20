import { STATUS_META } from "@/lib/appointmentStatus";
import { cn } from "@/lib/cn";

const TONES = {
  BOOKED: "border-ink bg-surface text-ink",
  COMPLETED: "border-neutral-300 bg-neutral-200 text-neutral-800",
  CANCELLED: "border-neutral-300 bg-canvas text-neutral-600 line-through",
  NO_SHOW: "border-neutral-300 bg-canvas text-neutral-600",
};

export default function CalendarBlock({ appointment, selected, onSelect, className, style, children }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(appointment.id)}
      aria-label={`${appointment.time} ${appointment.customer}, ${appointment.service.name}, ${STATUS_META[appointment.status].label}`}
      className={cn(
        "absolute overflow-hidden border text-left transition-shadow hover:z-10 hover:shadow-md",
        selected ? "border-accent bg-accent text-canvas" : TONES[appointment.status],
        className,
      )}
      style={style}
    >
      {children}
    </button>
  );
}
