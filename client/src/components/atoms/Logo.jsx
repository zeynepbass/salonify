import { cn } from "@/lib/cn";

const SIZES = {
  sm: { mark: "size-[18px]", text: "text-[18px]" },
  md: { mark: "size-[22px]", text: "text-[20px]" },
};

export default function Logo({ size = "md", showText = true, className }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-ink", className)}>
      <span className={cn("flex-none rotate-45 rounded-[5px] bg-gradient-to-br from-accent-400 via-accent to-accent-800", SIZES[size].mark)} />
      {showText && <span className={cn("font-extrabold tracking-[-0.02em]", SIZES[size].text)}>SalonaBOX</span>}
    </span>
  );
}
