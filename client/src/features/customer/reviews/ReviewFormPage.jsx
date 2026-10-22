"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import { Textarea } from "@/components/atoms/Input";
import Spinner from "@/components/atoms/Spinner";
import Switch from "@/components/atoms/Switch";
import BackLink from "@/components/molecules/BackLink";
import Field from "@/components/molecules/Field";
import StateMessage from "@/components/molecules/StateMessage";
import { useToast } from "@/components/organisms/ToastProvider";
import { toAppointmentView } from "@/features/customer/appointments/appointmentView";
import AppointmentNotFound from "@/features/customer/appointments/components/AppointmentNotFound";
import PhotoPicker from "@/features/customer/reviews/components/PhotoPicker";
import StarInput from "@/features/customer/reviews/components/StarInput";
import { api, getErrorMessage } from "@/lib/api";
import { formatLongDate } from "@/lib/date";

const MAX_COMMENT_LENGTH = 500;
const MAX_PHOTOS = 4;

export default function ReviewFormPage({ appointmentId }) {
  const router = useRouter();
  const commentId = useId();
  const shareLabelId = useId();
  const { showToast } = useToast();
  const [state, setState] = useState({ status: "loading", appointment: null });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [share, setShare] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    api
      .get(`/appointments/${appointmentId}`)
      .then((appointment) => !ignore && setState({ status: "success", appointment: toAppointmentView(appointment) }))
      .catch(() => !ignore && setState({ status: "error", appointment: null }));
    return () => {
      ignore = true;
    };
  }, [appointmentId]);

  if (state.status === "loading") {
    return (
      <div aria-busy="true" className="grid min-h-[50vh] place-items-center">
        <Spinner />
      </div>
    );
  }

  const { appointment } = state;
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (rating === 0 || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const uploads = await Promise.all(photos.map((photo) => api.uploadImage(photo.file)));
      await api.post(`/appointments/${appointment.id}/review`, {
        rating,
        comment: comment.trim(),
        hairPhotos: uploads.map((upload) => upload.url),
        isPublic: share,
      });
      showToast(share ? "Değerlendirmen gönderildi ve profilde paylaşıldı." : "Değerlendirmen gönderildi.");
      router.push("/randevularim?sekme=gecmis");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setSubmitting(false);
    }
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

      {error && (
        <p role="alert" className="mt-5 flex gap-2 bg-accent-100 p-3 text-[14px] text-accent-800">
          <Icon name="alert" size={16} className="mt-0.5" />
          {error}
        </p>
      )}

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
