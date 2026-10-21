"use client";

import Link from "next/link";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import Skeleton from "@/components/atoms/Skeleton";
import Tag from "@/components/atoms/Tag";
import { useLocation } from "@/features/location/LocationProvider";
import { getCategoryLabel } from "@/lib/catalog";
import { formatDistance, formatPrice, formatRating } from "@/lib/format";

export default function SalonCard({ salon }) {
  const { location } = useLocation();
  const place = [salon.neighborhood, salon.district].filter(Boolean).join(", ") || location.district;
  const hasDistance = typeof salon.distanceKm === "number";

  return (
    <article className="relative flex flex-col bg-surface transition-shadow duration-150 focus-within:shadow-md hover:shadow-md">
      <div className="relative">
        <ImagePlaceholder src={salon.coverImage} alt={salon.name} className="aspect-[4/3]" />
        <div className="absolute top-0 left-0 flex items-center gap-1.5 bg-canvas px-2.5 py-1.5 text-[14px] font-extrabold">
          <Icon name="star" size={14} filled className="text-accent" />
          {formatRating(salon.rating)}
          <span className="text-[12px] font-normal text-neutral-700">({salon.reviewCount})</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="text-[18px]">
          <Link href={`/kuaforler/${salon.id}`} className="outline-none after:absolute after:inset-0">
            {salon.name}
          </Link>
        </h3>
        <div className="flex items-center gap-1.5 text-[13px] text-neutral-700">
          <Icon name="pin" size={14} />
          {place}
          {hasDistance && ` · ${formatDistance(salon.distanceKm)}`}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {salon.categories.map((category) => (
            <Tag key={category}>{getCategoryLabel(category)}</Tag>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] text-neutral-700">Başlangıç</span>
            <span className="text-[16px] font-extrabold">
              {salon.startingPrice === null ? "—" : formatPrice(salon.startingPrice)}
            </span>
          </div>
          <Button variant="primary" href={`/kuaforler/${salon.id}/randevu`} className="relative px-3.5 py-2.5">
            Randevu Al
          </Button>
        </div>
      </div>
    </article>
  );
}

export function SalonCardSkeleton() {
  return (
    <div className="bg-surface">
      <Skeleton className="aspect-[4/3]" />
      <div className="grid gap-2.5 p-4">
        <Skeleton className="h-[18px] w-[70%]" />
        <Skeleton className="h-3 w-[45%]" />
        <Skeleton className="h-[22px] w-[60%]" />
        <Skeleton className="mt-2 h-[38px]" />
      </div>
    </div>
  );
}
