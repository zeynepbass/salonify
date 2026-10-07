import { cn } from "@/lib/cn";

export default function Tabs({ label, tabs, value, onChange, className }) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("flex gap-1 overflow-x-auto shadow-[inset_0_-2px_0_var(--color-line)]", className)}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
            className={cn(
              "border-b-[3px] px-3.5 py-3 text-[15px] font-bold whitespace-nowrap transition-colors",
              selected ? "border-accent text-ink" : "border-transparent text-neutral-700 hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
