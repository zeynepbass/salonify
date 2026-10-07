import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";

export default function ActiveFilters({ chips, onClear }) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          aria-label={`${chip.label} filtresini kaldır`}
          className="flex items-center gap-1.5 bg-ink py-1 pr-2 pl-2.5 text-[12px] text-canvas transition-colors hover:bg-neutral-800"
        >
          {chip.label}
          <Icon name="close" size={12} />
        </button>
      ))}
      <Button variant="ghost" className="text-[12px]" onClick={onClear}>
        Tümünü temizle
      </Button>
    </div>
  );
}
