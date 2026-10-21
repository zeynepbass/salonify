"use client";

import { useEffect, useState } from "react";
import Spinner from "@/components/atoms/Spinner";
import StarRating from "@/components/atoms/StarRating";
import Tag from "@/components/atoms/Tag";
import StateMessage from "@/components/molecules/StateMessage";
import { api, getErrorMessage } from "@/lib/api";
import { formatLongDate } from "@/lib/date";

const REVIEW_LIMIT = 50;

export default function MyReviewsSection() {
  const [state, setState] = useState({ status: "loading", reviews: [], error: null });

  useEffect(() => {
    let ignore = false;
    api
      .get("/users/me/reviews", { params: { limit: REVIEW_LIMIT } })
      .then((data) => !ignore && setState({ status: "success", reviews: data.items, error: null }))
      .catch((error) => !ignore && setState({ status: "error", reviews: [], error: getErrorMessage(error) }));
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section>
      <h2 className="mb-2 text-[20px]">Değerlendirmelerim</h2>
      {state.status === "loading" && (
        <div aria-busy="true" className="grid min-h-[20vh] place-items-center">
          <Spinner />
        </div>
      )}
      {state.status === "error" && <StateMessage role="alert" icon="alert" tone="accent" title="Değerlendirmeler yüklenemedi." description={state.error} />}
      {state.status === "success" && state.reviews.length === 0 && (
        <StateMessage icon="star" title="Henüz değerlendirme yapmadın." description="Tamamlanan randevularını değerlendirebilirsin." />
      )}
      {state.reviews.map((review) => (
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
      ))}
    </section>
  );
}
