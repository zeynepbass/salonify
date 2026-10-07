"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import { Textarea } from "@/components/atoms/Input";
import Switch from "@/components/atoms/Switch";
import BackLink from "@/components/molecules/BackLink";
import Field from "@/components/molecules/Field";
import StateMessage from "@/components/molecules/StateMessage";
import { useToast } from "@/components/organisms/ToastProvider";
import { useAppointments } from "@/features/appointments/AppointmentsProvider";
import AppointmentNotFound from "@/features/appointments/components/AppointmentNotFound";
import { useAppointment } from "@/features/appointments/useAppointment";
import PhotoPicker from "@/features/reviews/components/PhotoPicker";
import StarInput from "@/features/reviews/components/StarInput";
import { formatLongDate } from "@/lib/date";

const MAX_COMMENT_LENGTH = 500;
const MAX_PHOTOS = 4;

export default function ReviewFormPage({ appointmentId }) {
  const router = useRouter();
  const commentId = useId();
  const shareLabelId = useId();
  const appointment = useAppointment(appointmentId);
  const { markReviewed } = useAppointments();
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [share, setShare] = useState(true);

  if (!appointment) return <AppointmentNotFound />;

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
    markReviewed(appointment.id);
    showToast(share ? "Değerlendirmen gönderildi ve profilde paylaşıldı." : "Değerlendirmen gönderildi.");
    router.push("/randevularim?sekme=gecmis");
  };

  return (
    <form onSubmit={handleSubmit} className="page-container max-w-[720px] pt-6">
      <BackLink href="/randevularim">Randevularım</BackLink>
      <div className="mt-4 mb-8 flex items-center gap-4 bg-surface p-4">
        <ImagePlaceholder stripe={8} className="size-14 flex-none" />
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

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="submit" variant="primary" size="lg" disabled={rating === 0} className="gap-3">
          Değerlendirmeyi Gönder
          <Icon name="arrowRight" />
        </Button>
        <Button size="lg" href="/randevularim" className="text-[14px]">
          Vazgeç
        </Button>
      </div>
    </form>
  );
}
