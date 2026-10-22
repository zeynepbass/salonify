import Icon from "@/components/atoms/Icon";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import Switch from "@/components/atoms/Switch";
import Tag from "@/components/atoms/Tag";
import { formatDayMonth } from "@/lib/date";

function getVisibility(item) {
  if (!item.consent) return { label: "İzin yok", variant: "neutral", icon: "lock" };
  if (item.published) return { label: "Yayında", variant: "accent", icon: "check" };
  return { label: "Gizli", variant: "neutral" };
}

export default function PortfolioCard({ item, busy, onToggle }) {
  const visibility = getVisibility(item);
  const labelId = `portfolio-${item.id}`;

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="relative">
        <ImagePlaceholder
          src={item.image}
          alt={item.title || item.customer}
          stripe={12}
          className="aspect-[4/5]"
          imageClassName={item.consent ? undefined : "opacity-50"}
        />
        <Tag variant={visibility.variant} className="absolute top-2.5 left-2.5 shadow-sm">
          {visibility.icon && <Icon name={visibility.icon} size={12} />}
          {visibility.label}
        </Tag>
      </div>
      <div className="flex flex-col gap-1.5 p-3.5">
        <div className="flex justify-between gap-2">
          <strong>{item.customer}</strong>
          <span className="text-[12px] text-neutral-700">{formatDayMonth(item.date)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px]">{item.title}</span>
          {item.rating && (
            <span className="flex items-center gap-1 text-[13px] font-extrabold">
              <Icon name="star" size={14} filled className="text-accent" />
              {item.rating}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-line pt-2.5">
          <span id={labelId} className="text-[13px]">
            Profilde göster
          </span>
          <Switch
            checked={item.published && item.consent}
            disabled={!item.consent || busy}
            onChange={() => onToggle(item)}
            aria-labelledby={labelId}
            title={item.consent ? "Profilde göster" : "Müşteri paylaşım izni vermedi"}
          />
        </div>
      </div>
    </div>
  );
}
