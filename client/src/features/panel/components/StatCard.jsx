import Link from "next/link";
import Icon from "@/components/atoms/Icon";
import { cn } from "@/lib/cn";

export default function StatCard({ stat }) {
  return (
    <Link
      href={stat.href}
      className="flex flex-col items-center gap-1 border-b border-line px-3 py-5 text-center transition-colors hover:bg-surface"
    >
      <span className="flex items-center justify-center gap-2 text-[13px] font-semibold">
        <Icon name={stat.icon} />
        {stat.label}
      </span>
      <span className={cn("text-[52px] leading-none font-extrabold", stat.alert && "text-accent-700")}>
        {stat.value}
      </span>
      <span className="text-[12px] text-neutral-700">{stat.caption}</span>
    </Link>
  );
}
