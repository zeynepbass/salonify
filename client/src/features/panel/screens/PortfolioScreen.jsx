"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/atoms/Icon";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import Switch from "@/components/atoms/Switch";
import Tag from "@/components/atoms/Tag";
import SegmentedControl from "@/components/molecules/SegmentedControl";
import StateMessage from "@/components/molecules/StateMessage";
import QueryState from "@/components/organisms/QueryState";
import { useToast } from "@/components/organisms/ToastProvider";
import { usePortfolio, useTogglePortfolioItem } from "@/features/panel/hooks/usePortfolio";
import { getErrorMessage } from "@/lib/api";
import { formatDayMonth } from "@/lib/date";

const FILTERS = [
  { value: "all", label: "Tümü", match: () => true },
  { value: "published", label: "Yayında", match: (item) => item.published },
  { value: "no-consent", label: "İzin yok", match: (item) => !item.consent },
];

function getVisibility(item) {
  if (!item.consent) return { label: "İzin yok", variant: "neutral", icon: "lock" };
  if (item.published) return { label: "Yayında", variant: "accent", icon: "check" };
  return { label: "Gizli", variant: "neutral" };
}

function PortfolioCard({ item, busy, onToggle }) {
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

export default function PortfolioScreen() {
  const portfolioQuery = usePortfolio();

  return (
    <QueryState query={portfolioQuery} errorTitle="Portföy yüklenemedi.">
      {(portfolio) => <Portfolio portfolio={portfolio} />}
    </QueryState>
  );
}

function Portfolio({ portfolio }) {
  const { showToast } = useToast();
  const [filter, setFilter] = useState("all");
  const toggle = useTogglePortfolioItem();

  const items = useMemo(() => portfolio.filter(FILTERS.find((option) => option.value === filter).match), [portfolio, filter]);

  const handleToggle = (item) =>
    toggle.mutate(item, {
      onSuccess: () => showToast(item.published ? "Profilden kaldırıldı." : "Profilde yayınlandı."),
      onError: (error) => showToast(getErrorMessage(error), { tone: "error" }),
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl label="Portföy filtresi" options={FILTERS} value={filter} onChange={setFilter} optionClassName="px-3.5" />
        <p className="flex items-center gap-1.5 text-[13px] text-neutral-700">
          <Icon name="lock" size={14} />
          Paylaşım izni vermeyen müşterilerin içerikleri profilde yayınlanamaz.
        </p>
      </div>
      {items.length === 0 ? (
        <StateMessage icon="image" title="Bu filtrede içerik yok." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] sm:gap-5">
          {items.map((item) => (
            <PortfolioCard
              key={item.id}
              item={item}
              busy={toggle.isPending && toggle.variables?.id === item.id}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
