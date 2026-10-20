"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import BackLink from "@/components/molecules/BackLink";
import StatusTag from "@/components/molecules/StatusTag";
import AppointmentNotFound from "@/features/appointments/components/AppointmentNotFound";
import CancelAppointmentDialog from "@/features/appointments/components/CancelAppointmentDialog";
import { useAddToCalendar } from "@/features/appointments/useAddToCalendar";
import { useAppointment } from "@/features/appointments/useAppointment";
import { STATUS_META } from "@/lib/appointmentStatus";
import { formatLongDate } from "@/lib/date";
import { formatDuration, formatPrice } from "@/lib/format";

export default function AppointmentDetailPage({ appointmentId }) {
  const appointment = useAppointment(appointmentId);
  const addToCalendar = useAddToCalendar();
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!appointment) return <AppointmentNotFound />;

  const { salon, service } = appointment;
  const details = [
    { label: "Kuaför", value: salon.name },
    { label: "Hizmet", value: service.name },
    { label: "Tarih", value: formatLongDate(appointment.date, { withWeekday: true }) },
    { label: "Saat", value: appointment.time },
    { label: "Süre", value: formatDuration(service.duration, { long: true }) },
    { label: "Fiyat", value: formatPrice(service.price) },
    { label: "Konum", value: `${salon.neighborhood}, ${salon.district} · ${salon.city}` },
    { label: "Durum", value: STATUS_META[appointment.status].label },
  ];


  return (
    <div className="page-container max-w-[1080px] pt-6">
      <BackLink href="/randevularim">Randevularım</BackLink>
      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-[clamp(30px,3.6vw,44px)]">{service.name}</h1>
        <StatusTag status={appointment.status} />
      </div>

      <div className="flex flex-wrap items-start gap-10">
        <dl className="grid min-w-0 flex-[1_1_520px] grid-cols-[repeat(auto-fill,minmax(200px,1fr))] border-t-2 border-ink">
          {details.map((item) => (
            <div key={item.label} className="border-b border-line py-4 pr-4">
              <dt className="mb-1 text-[12px] text-neutral-700">{item.label}</dt>
              <dd className="text-[17px] font-bold">{item.value}</dd>
            </div>
          ))}
        </dl>

        <aside className="flex flex-[1_1_300px] flex-col gap-2 bg-surface p-5">
          <h2 className="eyebrow mb-1 tracking-[0.08em] text-neutral-700 text-center">İşlemler</h2>
          <Button size="md" align="start" className="gap-2.5 px-3" onClick={() => addToCalendar(appointment)}>
            <Icon name="calendarPlus" />
            Takvime ekle
          </Button>
          <Button size="md" align="start" className="gap-2.5 px-3" href={`tel:${salon.phone.replace(/\s/g, "")}`}>
            <Icon name="phone" />
            Kuaförü ara
          </Button>
          {appointment.upcoming && (
            <>
              <Button variant="danger" size="md" align="start" className="gap-2.5 px-3" onClick={() => setCancelOpen(true)}>
                <Icon name="closeCircle" />
                Randevuyu İptal Et
              </Button>
              <p className="mt-1 text-[12px] text-neutral-700">
                Randevudan 24 saat öncesine kadar ücretsiz iptal edebilirsin.
              </p>
            </>
          )}
          {appointment.canReview && (
            <Button
              variant="primary"
              size="md"
              align="start"
              className="gap-2.5 px-3"
              href={`/randevularim/${appointment.id}/degerlendir`}
            >
              <Icon name="star" size={14} filled />
              Değerlendir
            </Button>
          )}
          {!appointment.upcoming && (
            <p className="mt-1 text-[12px] text-neutral-700">Geçmiş randevular düzenlenemez veya iptal edilemez.</p>
          )}
        </aside>
      </div>

      {cancelOpen && <CancelAppointmentDialog appointment={appointment} onClose={() => setCancelOpen(false)} />}
    </div>
  );
}
