"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import { Textarea } from "@/components/atoms/Input";
import Spinner from "@/components/atoms/Spinner";
import Switch from "@/components/atoms/Switch";
import BackLink from "@/components/molecules/BackLink";
import ErrorNotice from "@/components/molecules/ErrorNotice";
import Field from "@/components/molecules/Field";
import PageSpinner from "@/components/molecules/PageSpinner";
import StateMessage from "@/components/molecules/StateMessage";
import { useToast } from "@/components/organisms/ToastProvider";
import AppointmentNotFound from "@/features/customer/appointments/components/AppointmentNotFound";
import { useAppointment } from "@/features/customer/appointments/hooks/useAppointment";
import PhotoPicker from "@/features/customer/reviews/components/PhotoPicker";
import StarInput from "@/features/customer/reviews/components/StarInput";
import { useCreateReview } from "@/features/customer/reviews/hooks/useReview";
import { getErrorMessage, isNotFound } from "@/lib/api";
import { formatLongDate } from "@/lib/date";

const MAX_COMMENT_LENGTH = 500;
const MAX_PHOTOS = 4;

export default function ReviewFormPage({ appointmentId }) {
  const router = useRouter();
  const commentId = useId();
  const shareLabelId = useId();
  const { showToast } = useToast();
  const { data: appointment, isPending, error } = useAppointment(appointmentId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [share, setShare] = useState(true);
  const review = useCreateReview(appointmentId, {
    onSuccess: () => {
      showToast(share ? "Değerlendirmen gönderildi ve profilde paylaşıldı." : "Değerlendirmen gönderildi.");
      router.push("/randevularim?sekme=gecmis");
    },
  });
  const submitting = review.isPending || review.isSuccess;

  if (isPending) return <PageSpinner label="Randevu yükleniyor" />;
  if (!appointment) return <AppointmentNotFound description={isNotFound(error) ? undefined : getErrorMessage(error)} />;

  if (!appointment.canReview) {
    return (
      <div className="page-container max-w-[720px] pt-10">
        <StateMessage
          icon="star"
          title={appointment.reviewed ? "Bu randevuyu zaten değerlendirdin." : "Bu randevu değerlendirilemez."}
          description="Yalnızca tamamlanan randevular bir kez değerlendirilebilir."
        >
          <Button variant="primary" href="/randevularim?sekme=gecmis">
            Randevularıma dön
          </Button>
        </StateMessage>
      </div>
    );
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (rating === 0 || submitting) return;
    review.mutate({ rating, comment, photos, isPublic: share });
  };

  return (
    <form onSubmit={handleSubmit} className="page-container max-w-[720px] pt-6">
      <BackLink href="/randevularim">Randevularım</BackLink>
      <div className="mt-4 mb-8 flex items-center gap-4 bg-surface p-4">
        <ImagePlaceholder src={appointment.salon.coverImage} alt={appointment.salon.name} stripe={8} className="size-14 flex-none" />
        <div>
          <div className="font-extrabold">{appointment.salon.name}</div>
          <div className="text-[13px] text-neutral-700">
            {appointment.service.name} · {formatLongDate(appointment.date)} · Tamamlandı
          </div>
        </div>
      </div>

      <h1 className="mb-4 text-[clamp(30px,3.6vw,44px)]">Deneyimin nasıldı?</h1>
      <StarInput value={rating} onChange={setRating} />

      <Field label="Yorumun" htmlFor={commentId} className="mt-7">
        <Textarea
          id={commentId}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={MAX_COMMENT_LENGTH}
          placeholder="Hizmet, iletişim, sonuç… Diğer müşterilere yardımcı olacak detayları paylaş."
          className="min-h-[140px]"
        />
        <div className="text-right text-[12px] text-neutral-700">
          {comment.length} / {MAX_COMMENT_LENGTH}
        </div>
      </Field>

      <div className="mt-3">
        <PhotoPicker photos={photos} max={MAX_PHOTOS} onChange={setPhotos} />
      </div>

      <div className="mt-7 flex flex-wrap items-start gap-4 border-y-2 border-line py-5">
        <div className="min-w-[220px] flex-1">
          <div id={shareLabelId} className="text-[15px] font-bold">
            Bu değerlendirmeyi kuaförün profilinde paylaşmak ister misiniz?
          </div>
          <div className="mt-1 text-[13px] text-neutral-700">
            Adınız ve fotoğrafınız kuaförün profilinde görüntülenebilir. İstediğin zaman profilinden kaldırabilirsin.
          </div>
        </div>
        <div className="flex flex-none items-center gap-2.5">
          <span className="text-[13px]">Profilde paylaş</span>
          <Switch checked={share} onChange={setShare} aria-labelledby={shareLabelId} />
        </div>
      </div>

      <ErrorNotice error={review.error} className="mt-5" />

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="submit" variant="primary" size="lg" disabled={rating === 0 || submitting} className="gap-3">
          {submitting ? "Gönderiliyor…" : "Değerlendirmeyi Gönder"}
          {submitting ? <Spinner /> : <Icon name="arrowRight" />}
        </Button>
        <Button size="lg" href="/randevularim" className="text-[14px]">
          Vazgeç
        </Button>
      </div>
    </form>
  );
}
