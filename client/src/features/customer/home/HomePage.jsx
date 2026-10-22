"use client";

import { useMemo, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import SegmentedControl from "@/components/molecules/SegmentedControl";
import CategoryGrid from "@/features/customer/home/components/CategoryGrid";
import HeroSearch from "@/features/customer/home/components/HeroSearch";
import SalonShowcase from "@/features/customer/home/components/SalonShowcase";
import { usePopularSalons, useSalonShowcase, useTopRatedSalons } from "@/features/customer/home/hooks/useHome";
import { useLocation } from "@/features/customer/location/LocationProvider";
import { DEFAULT_FILTERS, buildSalonParams, getSortOptions } from "@/features/customer/search/salonQuery";
import { buildSearchHref } from "@/features/customer/search/useSalonFilters";

const NEARBY_RADIUS_KM = 5;

export default function HomePage() {
  const { location, locationLabel, hasCoordinates } = useLocation();
  const [sort, setSort] = useState(DEFAULT_FILTERS.sort);
  const nearbyParams = useMemo(() => buildSalonParams({ sort, distance: NEARBY_RADIUS_KM }, location), [sort, location]);
  const nearbySalons = useSalonShowcase(nearbyParams);
  const popularSalons = usePopularSalons();
  const topRatedSalons = useTopRatedSalons();

  return (
    <>
      <HeroSearch />
      <CategoryGrid />

      <SalonShowcase
        title="Yakınındaki Kuaförler"
        subtitle={hasCoordinates ? `${locationLabel} · ${NEARBY_RADIUS_KM} km içinde` : locationLabel}
        query={nearbySalons}
        emptyText={`${locationLabel} için henüz kuaför yok.`}
        actions={
          <div className="flex max-w-full flex-wrap gap-2">
            <SegmentedControl
              label="Sıralama"
              options={getSortOptions(hasCoordinates)}
              value={sort}
              onChange={setSort}
              className="max-w-full overflow-x-auto"
            />
            <Button href={buildSearchHref({ sort })}>
              <Icon name="sliders" />
              Filtrele
            </Button>
          </div>
        }
      >
        <Button href="/kuaforler" size="md" className="mt-6 gap-3">
          Tüm kuaförleri gör
          <Icon name="arrowRight" />
        </Button>
      </SalonShowcase>

      <SalonShowcase
        title="Popüler Salonlar"
        subtitle="En çok değerlendirilen kuaförler"
        query={popularSalons}
        actions={
          <Button variant="ghost" href={buildSearchHref({ sort: "populer" })}>
            Tümünü gör
          </Button>
        }
      />

      <SalonShowcase
        title="Yüksek Puanlı Salonlar"
        subtitle="Müşteri değerlendirmelerinde öne çıkanlar"
        query={topRatedSalons}
        actions={
          <Button variant="ghost" href={buildSearchHref({ minRating: 4.8 })}>
            Tümünü gör
          </Button>
        }
      />
    </>
  );
}
