import Link from "next/link";
import Icon from "@/components/atoms/Icon";
import { cn } from "@/lib/cn";

const COLUMNS = {
  4: "grid-cols-4",
  5: "grid-cols-5",
};

export default function BottomNav({ label, items, className }) {
  return (
    <nav
      aria-label={label}
      className={cn("glass fixed inset-x-0 bottom-0 z-40 grid border-t border-line", COLUMNS[items.length], className)}
    >
      {items.map((item) => {
        const Component = item.href ? Link : "button";
        return (
          <Component
            key={item.label}
            href={item.href}
            type={item.href ? undefined : "button"}
            onClick={item.onClick}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "-mt-0.5 flex min-h-[60px] flex-col items-center justify-center gap-1 border-t-[3px] text-[11px] font-semibold",
              item.active ? "border-accent text-accent" : "border-transparent text-ink",
            )}
          >
            <Icon name={item.icon} />
            {item.label}
          </Component>
        );
      })}
    </nav>
  );
}
