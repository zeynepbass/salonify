"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/atoms/Icon";
import SegmentedControl from "@/components/molecules/SegmentedControl";
import StateMessage from "@/components/molecules/StateMessage";
import QueryState from "@/components/organisms/QueryState";
import { useToast } from "@/components/organisms/ToastProvider";
import PortfolioCard from "@/features/panel/components/PortfolioCard";
import { usePortfolio, useTogglePortfolioItem } from "@/features/panel/hooks/usePortfolio";

const FILTERS = [
  { value: "all", label: "Tümü", match: () => true },
  { value: "published", label: "Yayında", match: (item) => item.published },
  { value: "no-consent", label: "İzin yok", match: (item) => !item.consent },
];

export default function PortfolioScreen() {
  const portfolioQuery = usePortfolio();

  return (
    <QueryState query={portfolioQuery} errorTitle="Portföy yüklenemedi.">
      {(portfolio) => <Portfolio portfolio={portfolio} />}
    </QueryState>
  );
}

function Portfolio({ portfolio }) {
  const { showToast, showError } = useToast();
  const [filter, setFilter] = useState("all");
  const toggle = useTogglePortfolioItem();

  const items = useMemo(() => portfolio.filter(FILTERS.find((option) => option.value === filter).match), [portfolio, filter]);

  const handleToggle = (item) =>
    toggle.mutate(item, {
      onSuccess: () => showToast(item.published ? "Profilden kaldırıldı." : "Profilde yayınlandı."),
      onError: showError,
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
