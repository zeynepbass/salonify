"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import SegmentedControl from "@/components/molecules/SegmentedControl";
import StateMessage from "@/components/molecules/StateMessage";
import { useLocation } from "@/features/customer/location/LocationProvider";
import SalonGrid, { SalonGridSkeleton } from "@/features/customer/salon/components/SalonGrid";
import { useSalons } from "@/features/customer/search/hooks/useSearch";
import ActiveFilters from "@/features/customer/search/components/ActiveFilters";
import FilterPanel from "@/features/customer/search/components/FilterPanel";
import Pagination from "@/features/customer/search/components/Pagination";
import { AVAILABILITY_OPTIONS, DEFAULT_FILTERS, buildSalonParams, getSortOptions } from "@/features/customer/search/salonQuery";
import { useSalonFilters } from "@/features/customer/search/useSalonFilters";
import { getErrorMessage } from "@/lib/api";
import { getCategoryLabel } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { withLocativeSuffix } from "@/lib/format";
import { useBodyScrollLock, useEscapeKey } from "@/lib/hooks";

const PAGE_SIZE = 6;

const without = (list, item) => list.filter((value) => value !== item);

function buildChips(filters, updateFilters, hasCoordinates) {
  const chips = [
    ...filters.serviceIds.map((id) => ({
      key: `service-${id}`,
      label: getCategoryLabel(id),
      onRemove: () => updateFilters({ serviceIds: without(filters.serviceIds, id) }),
    })),
    ...filters.hairStyles.map((style) => ({
      key: `style-${style}`,
      label: style,
      onRemove: () => updateFilters({ hairStyles: without(filters.hairStyles, style) }),
    })),
  ];

  if (filters.query) {
    chips.unshift({ key: "query", label: `“${filters.query}”`, onRemove: () => updateFilters({ query: "" }) });
  }
  if (filters.minRating) {
    chips.push({
      key: "rating",
      label: `${filters.minRating.toLocaleString("tr-TR")}+ puan`,
      onRemove: () => updateFilters({ minRating: DEFAULT_FILTERS.minRating }),
    });
  }
  if (filters.availability !== DEFAULT_FILTERS.availability) {
    chips.push({
      key: "availability",
      label: AVAILABILITY_OPTIONS.find((option) => option.value === filters.availability).label,
      onRemove: () => updateFilters({ availability: DEFAULT_FILTERS.availability }),
    });
  }
  if (hasCoordinates && filters.distance !== DEFAULT_FILTERS.distance) {
    chips.push({
      key: "distance",
      label: `${filters.distance} km`,
      onRemove: () => updateFilters({ distance: DEFAULT_FILTERS.distance }),
    });
  }

  return chips;
}

export default function SearchPage() {
  const { location, locationLabel, hasCoordinates, openLocationDialog } = useLocation();
  const { filters, updateFilters, resetFilters } = useSalonFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);
  useEscapeKey(closeDrawer, drawerOpen);
  useBodyScrollLock(drawerOpen);

  const params = useMemo(() => buildSalonParams(filters, location, { limit: PAGE_SIZE }), [filters, location]);
  const salonsQuery = useSalons(params);
  const result = salonsQuery.data ?? { salons: [], total: 0, pageCount: 1 };

  const page = Math.min(filters.page, result.pageCount);
  const chips = buildChips(filters, updateFilters, hasCoordinates);

  return (
    <div className="page-container pt-7">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-line pb-5">
        <div>
          <nav aria-label="Sayfa yolu" className="flex items-center gap-1.5 text-[12px] text-neutral-700">
            <Link href="/" className="underline hover:text-accent">
              Ana sayfa
            </Link>
            <span>/</span>
            <span>Kuaförler</span>
          </nav>
          <h1 className="mt-1.5 text-[clamp(28px,3.4vw,40px)]">
            {withLocativeSuffix(location.district)} {result.total} kuaför
          </h1>
        </div>
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <Button className="md:hidden" onClick={() => setDrawerOpen(true)}>
            <Icon name="sliders" />
            Filtrele {chips.length > 0 && `(${chips.length})`}
          </Button>
          <SegmentedControl
            label="Sıralama"
            options={getSortOptions(hasCoordinates)}
            value={filters.sort}
            onChange={(sort) => updateFilters({ sort })}
            className="max-w-full overflow-x-auto"
          />
        </div>
      </div>

      <ActiveFilters chips={chips} onClear={resetFilters} />

      <div className="flex items-start gap-10 pt-6">
        {drawerOpen && <div className="fixed inset-0 z-55 bg-neutral-900/50 md:hidden" onClick={closeDrawer} />}
        <aside
          aria-label="Filtreler"
          className={cn(
            "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-60 max-md:max-h-[86vh] max-md:overflow-y-auto max-md:border-t-2 max-md:border-ink max-md:bg-canvas max-md:px-5 max-md:pt-4 max-md:pb-5",
            "md:sticky md:top-[92px] md:max-h-[calc(100vh-110px)] md:w-[270px] md:flex-none md:overflow-y-auto md:pr-1",
            !drawerOpen && "max-md:hidden",
          )}
        >
          <FilterPanel
            filters={filters}
            locationLabel={locationLabel}
            resultCount={result.total}
            showDistance={hasCoordinates}
            onChange={updateFilters}
            onReset={resetFilters}
            onChangeLocation={() => {
              closeDrawer();
              openLocationDialog();
            }}
            onClose={closeDrawer}
          />
        </aside>

        <div className="min-w-0 flex-1">
          {salonsQuery.isPending ? (
            <SalonGridSkeleton density="compact" />
          ) : salonsQuery.isError ? (
            <StateMessage
              role="alert"
              icon="alert"
              tone="accent"
              title="Kuaförler yüklenemedi."
              description={getErrorMessage(salonsQuery.error)}
            >
              <Button onClick={() => salonsQuery.refetch()}>Tekrar dene</Button>
            </StateMessage>
          ) : result.salons.length === 0 ? (
            <StateMessage
              icon="search"
              title="Bu kriterlere uygun kuaför bulunamadı."
              description="Mesafeyi artırmayı ya da bazı filtreleri kaldırmayı dene."
            >
              <Button onClick={resetFilters}>Filtreleri temizle</Button>
            </StateMessage>
          ) : (
            <div className={cn("transition-opacity", salonsQuery.isPlaceholderData && "opacity-60")} aria-busy={salonsQuery.isFetching}>
              <SalonGrid salons={result.salons} density="compact" />
              <Pagination page={page} pageCount={result.pageCount} onChange={(next) => updateFilters({ page: next })} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
