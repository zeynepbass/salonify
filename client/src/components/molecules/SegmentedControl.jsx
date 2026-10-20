import { cn } from "@/lib/cn";

export default function SegmentedControl({ label, options, value, onChange, className, optionClassName }) {
  return (
    <div role="group" aria-label={label} className={cn("flex border border-line", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-3 py-2 text-[13px] whitespace-nowrap transition-colors",
              selected ? "bg-accent text-canvas" : "text-ink hover:bg-neutral-200",
              optionClassName,
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
