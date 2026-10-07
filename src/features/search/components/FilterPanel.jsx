import Button from "@/components/atoms/Button";
import Checkbox from "@/components/atoms/Checkbox";
import Icon from "@/components/atoms/Icon";
import Radio from "@/components/atoms/Radio";
import SegmentedControl from "@/components/molecules/SegmentedControl";
import { salons } from "@/data/mock/salons";
import { hairStyles, services } from "@/data/mock/services";
import { AVAILABILITY_OPTIONS, DISTANCE_OPTIONS, RATING_OPTIONS } from "@/features/search/salonQuery";
import { cn } from "@/lib/cn";

const toggleItem = (list, item) => (list.includes(item) ? list.filter((value) => value !== item) : [...list, item]);

function Section({ title, className, children }) {
  return (
    <div className={cn("border-b border-line py-4", className)}>
      <h3 className="eyebrow mb-2.5 tracking-[0.08em] text-neutral-700">{title}</h3>
      {children}
    </div>
  );
}

export default function FilterPanel({ filters, locationLabel, resultCount, onChange, onReset, onChangeLocation, onClose }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b-2 border-line pb-3 md:hidden">
        <h2 className="text-[20px]">Filtreler</h2>
        <Button variant="plain" size="icon" aria-label="Filtreleri kapat" onClick={onClose}>
          <Icon name="close" />
        </Button>
      </div>

      <Section title="Konum" className="md:pt-0">
        <button
          type="button"
          onClick={onChangeLocation}
          className="flex w-full items-center gap-2 border border-line bg-surface px-3 py-2.5 text-left text-[14px] transition-colors hover:border-ink"
        >
          <Icon name="pin" className="text-accent" />
          <span className="flex-1">{locationLabel}</span>
          <span className="text-[12px] text-accent-700">Değiştir</span>
        </button>
      </Section>

      <Section title="Mesafe">
        <SegmentedControl
          label="Mesafe"
          options={DISTANCE_OPTIONS}
          value={filters.distance}
          onChange={(distance) => onChange({ distance })}
          className="grid grid-cols-4"
          optionClassName="px-0"
        />
      </Section>

      <Section title="Hizmet">
        {services.map((service) => (
          <Checkbox
            key={service.id}
            checked={filters.serviceIds.includes(service.id)}
            onChange={() => onChange({ serviceIds: toggleItem(filters.serviceIds, service.id) })}
          >
            {service.name}
            <span className="ml-auto text-[12px] text-neutral-600">
              {salons.filter((salon) => salon.featuredServiceIds.includes(service.id)).length}
            </span>
          </Checkbox>
        ))}
      </Section>

      <Section title="Saç stili">
        <div className="flex flex-wrap gap-1.5">
          {hairStyles.map((style) => {
            const selected = filters.hairStyles.includes(style);
            return (
              <button
                key={style}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ hairStyles: toggleItem(filters.hairStyles, style) })}
                className={cn(
                  "border px-2.5 py-1.5 text-[13px] transition-colors",
                  selected ? "border-ink bg-ink text-canvas" : "border-line hover:border-ink",
                )}
              >
                {style}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Minimum puan">
        <div role="radiogroup" aria-label="Minimum puan" className="flex flex-col gap-2.5">
          {RATING_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="min-rating"
              checked={filters.minRating === option.value}
              onChange={() => onChange({ minRating: option.value })}
            >
              {option.label}
            </Radio>
          ))}
        </div>
      </Section>

      <Section title="Uygunluk" className="border-b-0">
        <div role="radiogroup" aria-label="Uygunluk" className="flex flex-col gap-2.5">
          {AVAILABILITY_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="availability"
              checked={filters.availability === option.value}
              onChange={() => onChange({ availability: option.value })}
            >
              {option.label}
            </Radio>
          ))}
        </div>
      </Section>

      <div className="flex gap-2 border-t-2 border-line pt-3">
        <Button align="start" className="flex-1" onClick={onReset}>
          Temizle
        </Button>
        <Button variant="primary" align="start" className="flex-[2] md:hidden" onClick={onClose}>
          {resultCount} sonucu göster
        </Button>
      </div>
    </div>
  );
}
