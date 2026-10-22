import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/format";

const SIZES = {
  sm: "size-9 text-[13px]",
  md: "size-11 text-[14px]",
  lg: "size-24 text-[32px]",
};

const TONES = {
  dark: "bg-gradient-to-br from-accent to-accent-800 text-canvas",
  neutral: "bg-neutral-300 text-ink",
};

export default function Avatar({ name, size = "md", tone = "neutral", className }) {
  return (
    <span aria-hidden="true" className={cn("grid flex-none place-items-center rounded-full font-extrabold", SIZES[size], TONES[tone], className)}>
      {getInitials(name)}
    </span>
  );
}
