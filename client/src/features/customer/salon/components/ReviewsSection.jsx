"use client";

import { useState } from "react";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import StarRating from "@/components/atoms/StarRating";
import Tag from "@/components/atoms/Tag";
import StateMessage from "@/components/molecules/StateMessage";
import QueryState from "@/components/organisms/QueryState";
import SalonSection from "@/features/customer/salon/components/SalonSection";
import { formatLongDate } from "@/lib/date";
import { formatRating } from "@/lib/format";

const PREVIEW_COUNT = 3;

function RatingSummary({ summary }) {
  const { averageRating: rating, reviewCount, distribution } = summary;

  return (
    <div className="min-w-[240px] flex-[0_1_300px] border-t-2 border-ink pt-5">
      <div className="text-[64px] leading-none font-extrabold">{formatRating(rating)}</div>
      <StarRating value={rating} size={18} className="mt-2.5 mb-1.5 gap-0.5" />
      <div className="text-[14px] text-neutral-700">{reviewCount} değerlendirme</div>
      <div className="mt-5 flex flex-col gap-1.5">
        {distribution.map((row) => (
          <div key={row.stars} className="flex items-center gap-2.5 text-[12px]">
            <span className="w-2.5">{row.stars}</span>
            <div className="h-1.5 flex-1 bg-neutral-200">
              <div className="h-full bg-ink" style={{ width: `${row.percent}%` }} />
            </div>
            <span className="w-8 text-right text-neutral-700">%{row.percent}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewItem({ review }) {
  return (
    <article className="flex gap-4 border-t border-line py-5">
      <Avatar name={review.authorName} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap justify-between gap-2">
          <strong className="text-[15px]">{review.authorName}</strong>
          <span className="text-[12px] text-neutral-700">{formatLongDate(review.createdAt.slice(0, 10))}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <StarRating value={review.rating} />
          <Tag>{review.serviceName}</Tag>
        </div>
        {review.comment && <p className="max-w-[68ch] text-[14px] leading-[1.6]">{review.comment}</p>}
        {review.hairPhotos.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {review.hairPhotos.map((photo) => (
              <ImagePlaceholder key={photo} src={photo} alt="Müşteri saç fotoğrafı" stripe={8} className="h-[120px] w-24" />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function ReviewList({ reviews }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? reviews : reviews.slice(0, PREVIEW_COUNT);

  return (
    <div className="flex min-w-0 flex-[1_1_480px] flex-col">
      {reviews.length === 0 ? (
        <StateMessage icon="star" title="Henüz değerlendirme yok." description="İlk değerlendirmeyi sen yapabilirsin." />
      ) : (
        visible.map((review) => <ReviewItem key={review.id} review={review} />)
      )}
      {reviews.length > PREVIEW_COUNT && (
        <Button className="mt-2 self-start" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Daha az göster" : `Tüm değerlendirmeleri gör (${reviews.length})`}
        </Button>
      )}
    </div>
  );
}

export default function ReviewsSection({ query }) {
  return (
    <SalonSection id="degerlendirmeler" title="Değerlendirmeler">
      <QueryState query={query} errorTitle="Değerlendirmeler yüklenemedi.">
        {(data) => (
          <div className="flex flex-wrap items-start gap-10">
            <RatingSummary summary={data.summary} />
            <ReviewList reviews={data.items} />
          </div>
        )}
      </QueryState>
    </SalonSection>
  );
}
