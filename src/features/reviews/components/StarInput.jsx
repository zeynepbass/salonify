import Icon from "@/components/atoms/Icon";
import { ratingLabels } from "@/data/mock/reviews";
import { cn } from "@/lib/cn";

export default function StarInput({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Puan" className="flex flex-wrap items-center gap-1.5">
      {ratingLabels.map((label, index) => {
        const star = index + 1;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} yıldız, ${label}`}
            onClick={() => onChange(star)}
            className={cn(
              "grid size-[52px] place-items-center border border-line transition-colors hover:border-ink",
              star <= value ? "text-accent" : "text-neutral-400",
            )}
          >
            <Icon name="star" size={28} filled />
          </button>
        );
      })}
      <span className="ml-2.5 text-[15px] font-bold">
        {value ? ratingLabels[value - 1] : "Puan vermek için bir yıldız seç"}
      </span>
    </div>
  );
}
