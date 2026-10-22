import { cn } from "@/lib/cn";
import { formatDuration, formatPrice } from "@/lib/format";

export default function ServicePicker({ services, value, onChange, labelledBy }) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-col gap-2">
      {services.map((service) => {
        const selected = service.id === value;
        return (
          <button
            key={service.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(service.id)}
            className={cn(
              "flex w-full flex-wrap items-center gap-x-3.5 gap-y-1 rounded-lg border px-4 py-3.5 text-left transition-all hover:border-accent-400",
              selected ? "border-accent bg-accent-100/50 shadow-[inset_0_0_0_1px_var(--color-accent)]" : "border-line bg-canvas",
            )}
          >
            <span className={cn("grid size-[18px] flex-none place-items-center rounded-full border-2", selected ? "border-accent" : "border-neutral-500")}>
              <span className={cn("size-2 rounded-full", selected && "bg-accent")} />
            </span>
            <span className="min-w-0 text-[15px] font-bold">{service.name}</span>
            <span className="flex-1 text-[13px] text-neutral-700">{formatDuration(service.duration)}</span>
            <span className="min-w-[84px] text-right font-extrabold text-ink">{formatPrice(service.price)}</span>
          </button>
        );
      })}
    </div>
  );
}
