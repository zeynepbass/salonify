import Link from "next/link";
import Icon from "@/components/atoms/Icon";

export default function BackLink({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-9 items-center gap-2 py-2 text-[14px] font-semibold text-ink transition-colors hover:text-accent"
    >
      <Icon name="arrowLeft" />
      {children}
    </Link>
  );
}
