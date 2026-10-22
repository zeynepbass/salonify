import Icon from "@/components/atoms/Icon";
import Skeleton from "@/components/atoms/Skeleton";
import { cn } from "@/lib/cn";

const GRID = "grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2";

function Notice({ children }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-neutral-400 px-5 py-7 text-[14px] text-neutral-700">
      <Icon name="calendar" />
      {children}
    </div>
  );
}

export default function SlotPicker({ slots, value, loading, hasDate, onChange }) {
  if (!hasDate) return <Notice>Uygun saatleri görmek için önce bir tarih seç.</Notice>;

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Saatler yükleniyor" className={GRID}>
        {Array.from({ length: 10 }, (_, index) => (
          <Skeleton key={index} className="h-[58px]" />
        ))}
      </div>
    );
  }

  if (!slots.some((slot) => slot.available)) {
    return <Notice>Bu tarihte boş saat kalmadı. Başka bir gün seçebilirsin.</Notice>;
  }

  return (
    <div role="group" aria-label="Saatler" className={GRID}>
      {slots.map((slot) => {
        const selected = slot.time === value;
        return (
          <button
            key={slot.time}
            type="button"
            disabled={!slot.available}
            aria-pressed={selected}
            aria-label={`${slot.time} ${slot.available ? "boş" : "dolu"}`}
            onClick={() => onChange(slot.time)}
            className={cn(
              "flex flex-col items-start gap-0.5 rounded-md border px-3 py-2.5 text-left transition-all",
              selected && "border-accent bg-accent text-canvas shadow-md",
              !selected && slot.available && "border-line bg-canvas hover:-translate-y-px hover:border-accent-400",
              !slot.available && "stripes-muted cursor-not-allowed border-neutral-300 text-neutral-600",
            )}
          >
            <span className={cn("text-[16px] font-extrabold", !slot.available && "line-through")}>{slot.time}</span>
            <span className="text-[12px]">{!slot.available ? "Dolu" : selected ? "Seçildi" : "Boş"}</span>
          </button>
        );
      })}
    </div>
  );
}
