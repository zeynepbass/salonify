import { cn } from "@/lib/cn";

const VARIANTS = {
  neutral: "bg-neutral-200 text-neutral-800",
  accent: "bg-accent-100 text-accent-800",
  outline: "border border-line text-neutral-700",
};

export default function Tag({ variant = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded-full px-2.5 py-0.5 text-[12px] font-semibold whitespace-nowrap",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
