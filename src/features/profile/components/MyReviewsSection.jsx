import StarRating from "@/components/atoms/StarRating";
import Tag from "@/components/atoms/Tag";
import StateMessage from "@/components/molecules/StateMessage";
import { getSalon, getServiceName } from "@/lib/catalog";
import { formatLongDate } from "@/lib/date";

export default function MyReviewsSection({ reviews }) {
  return (
    <section>
      <h2 className="mb-2 text-[20px]">Değerlendirmelerim</h2>
      {reviews.length === 0 && (
        <StateMessage icon="star" title="Henüz değerlendirme yapmadın." description="Tamamlanan randevularını değerlendirebilirsin." />
      )}
      {reviews.map((review) => (
        <article key={review.id} className="flex flex-col gap-1.5 border-t border-line py-[18px]">
          <div className="flex flex-wrap justify-between gap-2">
            <strong>
              {getSalon(review.salonId).name} · {getServiceName(review.serviceId)}
            </strong>
            <span className="text-[12px] text-neutral-700">{formatLongDate(review.date)}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <StarRating value={review.rating} />
            <Tag variant={review.shared ? "accent" : "neutral"}>
              {review.shared ? "Profilde paylaşıldı" : "Yalnızca kuaför görür"}
            </Tag>
          </div>
          <p className="text-[14px]">{review.text}</p>
        </article>
      ))}
    </section>
  );
}
