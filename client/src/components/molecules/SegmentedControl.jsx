import { cn } from "@/lib/cn";

export default function SegmentedControl({ label, options, value, onChange, className, optionClassName }) {
  return (
    <div role="group" aria-label={label} className={cn("flex gap-0.5 rounded-lg bg-neutral-200/70 p-1", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-all",
              selected ? "bg-canvas text-ink shadow-sm" : "text-neutral-700 hover:text-ink",
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
