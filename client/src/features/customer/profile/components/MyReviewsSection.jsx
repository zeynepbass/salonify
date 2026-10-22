"use client";

import StarRating from "@/components/atoms/StarRating";
import Tag from "@/components/atoms/Tag";
import StateMessage from "@/components/molecules/StateMessage";
import QueryState from "@/components/organisms/QueryState";
import { useMyReviews } from "@/features/customer/profile/hooks/useProfile";
import { formatLongDate } from "@/lib/date";

export default function MyReviewsSection() {
  const reviewsQuery = useMyReviews();

  return (
    <section>
      <h2 className="mb-2 text-[20px]">Değerlendirmelerim</h2>
      <QueryState
        query={reviewsQuery}
        errorTitle="Değerlendirmeler yüklenemedi."
        isEmpty={(reviews) => reviews.length === 0}
        empty={<StateMessage icon="star" title="Henüz değerlendirme yapmadın." description="Tamamlanan randevularını değerlendirebilirsin." />}
      >
        {(reviews) =>
          reviews.map((review) => (
            <article key={review.id} className="flex flex-col gap-1.5 border-t border-line py-[18px]">
              <div className="flex flex-wrap justify-between gap-2">
                <strong>
                  {review.salon?.name ?? "Kuaför"} · {review.serviceName}
                </strong>
                <span className="text-[12px] text-neutral-700">{formatLongDate(review.createdAt.slice(0, 10))}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <StarRating value={review.rating} />
                <Tag variant={review.isPublic ? "accent" : "neutral"}>
                  {review.isPublic ? "Profilde paylaşıldı" : "Yalnızca kuaför görür"}
                </Tag>
              </div>
              {review.comment && <p className="text-[14px]">{review.comment}</p>}
            </article>
          ))
        }
      </QueryState>
    </section>
  );
}
