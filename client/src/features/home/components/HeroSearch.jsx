"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import { popularSearches } from "@/data/mock/services";
import { useLocation } from "@/features/location/LocationProvider";
import { buildSearchHref } from "@/features/search/useSalonFilters";

const SEARCH_LABEL = "Kuaför, hizmet veya saç stili ara";

function getPopularHref({ serviceId, hairStyle }) {
  return buildSearchHref(serviceId ? { serviceIds: [serviceId] } : { hairStyles: [hairStyle] });
}

export default function HeroSearch() {
  const router = useRouter();
  const { locationLabel, openLocationDialog } = useLocation();
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    router.push(buildSearchHref({ query: query.trim() }));
  };

  return (
    <section className="page-container flex flex-wrap gap-12 pt-[clamp(32px,6vw,72px)] pb-14">
      <div className="flex min-w-0 flex-[1_1_560px] flex-col justify-center gap-6">
        <p className="eyebrow text-accent-700">Kuaför randevusu · Onay beklemeden</p>
        <h1 className="max-w-[15ch] text-[clamp(38px,5.2vw,68px)] leading-[1.02] text-balance">
          Hayalindeki saç stiline en yakın kuaförü keşfet.
        </h1>
        <p className="max-w-[52ch] text-[18px] text-pretty text-neutral-700">
          Puanları, portföyleri ve gerçek boş saatleri karşılaştır. Uygun saati seç, randevun anında oluşsun.
        </p>
        <form role="search" onSubmit={handleSubmit} className="flex flex-wrap border border-ink bg-surface">
          <label className="flex min-h-[60px] flex-[2_1_260px] items-center gap-2.5 border-line px-4 max-sm:border-b sm:border-r">
            <Icon name="search" className="text-neutral-600" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={SEARCH_LABEL}
              aria-label={SEARCH_LABEL}
              className="h-[52px] min-w-0 flex-1 bg-transparent text-[16px] outline-none"
            />
          </label>
          <button
            type="button"
            onClick={openLocationDialog}
            aria-label={`Konum seç, şu an ${locationLabel}`}
            className="flex min-h-[60px] flex-[1_1_200px] items-center gap-2.5 px-4 text-left text-[15px] transition-colors hover:bg-neutral-200"
          >
            <Icon name="pin" className="text-accent" />
            <span className="flex-1">{locationLabel}</span>
            <Icon name="chevronDown" />
          </button>
          <Button type="submit" variant="primary" align="start" className="min-h-[60px] gap-3 px-7 text-[16px] max-sm:flex-1">
            Ara
            <Icon name="arrowRight" />
          </Button>
        </form>
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <span className="text-neutral-700">Popüler:</span>
          {popularSearches.map((item) => (
            <Link
              key={item.label}
              href={getPopularHref(item)}
              className="border border-line px-2.5 py-1 transition-colors hover:border-ink"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <ImagePlaceholder
        label="hero görseli · salon iç mekân, siyah-beyaz"
        className="min-h-[240px] min-w-0 flex-[1_1_360px] md:min-h-[360px]"
      />
    </section>
  );
}
