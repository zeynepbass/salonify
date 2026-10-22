import Icon from "@/components/atoms/Icon";
import { cn } from "@/lib/cn";

export default function SearchInput({ value, onChange, placeholder, className }) {
  return (
    <label className={cn("flex items-center gap-2 rounded-md border border-line bg-canvas px-2.5 transition-colors focus-within:border-accent focus-within:ring-3 focus-within:ring-accent-100", className)}>
      <Icon name="search" className="text-neutral-600" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none"
      />
    </label>
  );
}
