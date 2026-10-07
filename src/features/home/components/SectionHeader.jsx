import { cn } from "@/lib/cn";

export default function SectionHeader({ title, subtitle, className, children }) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4 border-t-2 border-line pt-6", className)}>
      <div>
        <h2 className="text-[28px]">{title}</h2>
        {subtitle && <p className="mt-1 text-[13px] text-neutral-700">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
