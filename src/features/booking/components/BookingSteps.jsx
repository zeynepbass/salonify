import Icon from "@/components/atoms/Icon";
import { cn } from "@/lib/cn";

const STEPS = ["Hizmet", "Tarih", "Saat", "Özet"];

export default function BookingSteps({ current }) {
  return (
    <ol aria-label="Adımlar" className="mb-8 grid grid-cols-4 border-t-2 border-line">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className={cn(
              "-mt-0.5 flex items-center gap-2.5 border-t-[3px] pt-3.5 pr-2 text-[14px] max-sm:flex-col max-sm:items-start max-sm:gap-1.5 max-sm:text-[12px]",
              done || active ? "border-ink text-ink" : "border-transparent text-neutral-600",
              active ? "font-extrabold" : "font-semibold",
            )}
          >
            <span
              className={cn(
                "grid size-[26px] flex-none place-items-center border text-[12px] font-extrabold",
                done && "border-ink bg-ink text-canvas",
                active && "border-accent bg-accent text-canvas",
                !done && !active && "border-line text-neutral-700",
              )}
            >
              {done ? <Icon name="check" size={12} /> : index + 1}
            </span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}
