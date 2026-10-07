"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import SegmentedControl from "@/components/molecules/SegmentedControl";
import { salons } from "@/data/mock/salons";
import CategoryGrid from "@/features/home/components/CategoryGrid";
import HeroSearch from "@/features/home/components/HeroSearch";
import SalonShowcase from "@/features/home/components/SalonShowcase";
import { useLocation } from "@/features/location/LocationProvider";
import { DEFAULT_FILTERS, SORT_OPTIONS, sortSalons } from "@/features/search/salonQuery";
import { buildSearchHref } from "@/features/search/useSalonFilters";

const NEARBY_RADIUS_KM = 5;
const SHOWCASE_SIZE = 4;

const topRatedSalons = sortSalons(salons, "puan").slice(0, SHOWCASE_SIZE);
const popularSalons = sortSalons(salons, "populer").slice(0, SHOWCASE_SIZE);

export default function HomePage() {
  const { locationLabel } = useLocation();
  const [sort, setSort] = useState(DEFAULT_FILTERS.sort);

  const nearbySalons = sortSalons(
    salons.filter((salon) => salon.distanceKm <= NEARBY_RADIUS_KM),
    sort,
  );

  return (
    <>
      <HeroSearch />
      <CategoryGrid />

      <SalonShowcase
        title="Yakınındaki Kuaförler"
        subtitle={`${locationLabel} · ${NEARBY_RADIUS_KM} km içinde`}
        salons={nearbySalons}
        actions={
          <div className="flex max-w-full flex-wrap gap-2">
            <SegmentedControl
              label="Sıralama"
              options={SORT_OPTIONS}
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
        subtitle="Bu ay en çok randevu alınan kuaförler"
        salons={popularSalons}
        actions={
          <Button variant="ghost" href={buildSearchHref({ sort: "populer" })}>
            Tümünü gör
          </Button>
        }
      />

      <SalonShowcase
        title="Yüksek Puanlı Salonlar"
        subtitle="Müşteri değerlendirmelerinde öne çıkanlar"
        salons={topRatedSalons}
        actions={
          <Button variant="ghost" href={buildSearchHref({ minRating: 4.8 })}>
            Tümünü gör
          </Button>
        }
      />
    </>
  );
}
