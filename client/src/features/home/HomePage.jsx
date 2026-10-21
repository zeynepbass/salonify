"use client";

import { useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import SegmentedControl from "@/components/molecules/SegmentedControl";
import CategoryGrid from "@/features/home/components/CategoryGrid";
import HeroSearch from "@/features/home/components/HeroSearch";
import SalonShowcase from "@/features/home/components/SalonShowcase";
import { useLocation } from "@/features/location/LocationProvider";
import { DEFAULT_FILTERS, buildSalonParams, getSortOptions } from "@/features/search/salonQuery";
import { buildSearchHref } from "@/features/search/useSalonFilters";
import { api } from "@/lib/api";

const NEARBY_RADIUS_KM = 5;
const SHOWCASE_SIZE = 4;

export default function HomePage() {
  const { location, locationLabel, hasCoordinates } = useLocation();
  const [sort, setSort] = useState(DEFAULT_FILTERS.sort);
  const [nearbySalons, setNearbySalons] = useState(null);
  const [popularSalons, setPopularSalons] = useState(null);
  const [topRatedSalons, setTopRatedSalons] = useState(null);

  const nearbyParams = JSON.stringify(
    buildSalonParams({ sort, distance: NEARBY_RADIUS_KM }, location, { limit: SHOWCASE_SIZE }),
  );

  useEffect(() => {
    let ignore = false;
    api
      .get("/salons", { params: JSON.parse(nearbyParams) })
      .then((data) => !ignore && setNearbySalons(data.items))
      .catch(() => !ignore && setNearbySalons([]));
    return () => {
      ignore = true;
    };
  }, [nearbyParams]);

  useEffect(() => {
    let ignore = false;
    const load = (params, setSalons) =>
      api
        .get("/salons", { params: { ...params, limit: SHOWCASE_SIZE } })
        .then((data) => !ignore && setSalons(data.items))
        .catch(() => !ignore && setSalons([]));

    load({ sort: "popular" }, setPopularSalons);
    load({ sort: "rating", rating: 4.8 }, setTopRatedSalons);
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <HeroSearch />
      <CategoryGrid />

      <SalonShowcase
        title="Yakınındaki Kuaförler"
        subtitle={hasCoordinates ? `${locationLabel} · ${NEARBY_RADIUS_KM} km içinde` : locationLabel}
        salons={nearbySalons}
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
