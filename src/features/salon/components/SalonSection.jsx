import { cn } from "@/lib/cn";

export default function SalonSection({ id, title, aside, className, children }) {
  return (
    <section id={id} className={cn("scroll-mt-[130px] pt-14", className)}>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[28px]">{title}</h2>
        {aside && <span className="text-[13px] text-neutral-700">{aside}</span>}
      </div>
      {children}
    </section>
  );
}
