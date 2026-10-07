import Icon from "@/components/atoms/Icon";
import { cn } from "@/lib/cn";

const TONES = {
  light: { on: "text-accent", off: "text-neutral-300" },
  dark: { on: "text-accent-400", off: "text-neutral-600" },
};

export default function StarRating({ value, size = 14, tone = "light", className }) {
  return (
    <span role="img" aria-label={`5 üzerinden ${value} yıldız`} className={cn("inline-flex gap-px", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon key={star} name="star" size={size} filled className={star <= Math.round(value) ? TONES[tone].on : TONES[tone].off} />
      ))}
    </span>
  );
}
