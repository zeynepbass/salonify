import { cn } from "@/lib/cn";

export default function Switch({ checked, onChange, disabled = false, className, ...props }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 flex-none transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-accent" : "bg-neutral-400",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 bg-canvas transition-[left] duration-150",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}
