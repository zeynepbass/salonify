"use client";

import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import Tag from "@/components/atoms/Tag";
import Stat from "@/components/molecules/Stat";
import AppointmentNotFound from "@/features/appointments/components/AppointmentNotFound";
import { useAddToCalendar } from "@/features/appointments/useAddToCalendar";
import { useAppointment } from "@/features/appointments/useAppointment";
import { formatLongDate } from "@/lib/date";
import { formatDuration, formatPrice } from "@/lib/format";

export default function BookingSuccessPage({ appointmentId }) {
  const appointment = useAppointment(appointmentId);
  const addToCalendar = useAddToCalendar();

  if (!appointment) return <AppointmentNotFound />;

  const { salon, service } = appointment;


  return (
    <div role="status" className="page-container flex max-w-[760px] flex-col gap-5 pt-14">
      <span className="grid size-[72px] place-items-center bg-accent text-canvas">
        <Icon name="check" size={36} />
      </span>
      <h1 className="text-[clamp(32px,4.4vw,52px)] tracking-[-0.025em]">Randevunuz oluşturuldu.</h1>
      <p className="max-w-[56ch] text-[16px] text-neutral-700">
        {salon.name} kuaförüne bildirim gönderildi. Randevudan 24 saat önce hatırlatma alacaksın.
      </p>

      <div className="flex flex-col gap-1 border-t-2 border-ink bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[12px] text-neutral-700">Randevu no: {appointment.reference}</span>
          <Tag variant="accent" className="gap-1.5">
            <Icon name="calendarCheck" size={12} />
            Randevu alındı
          </Tag>
        </div>
        <div className="mt-2.5 text-[24px] font-extrabold">{salon.name}</div>
        <div className="text-[16px]">{service.name}</div>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 border-t border-line pt-4">
          <Stat label="Tarih">{formatLongDate(appointment.date)}</Stat>
          <Stat label="Saat">{appointment.time}</Stat>
          <Stat label="Süre">{formatDuration(service.duration, { long: true })}</Stat>
          <Stat label="Ücret">{formatPrice(service.price)}</Stat>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="lg" href="/randevularim" className="gap-3">
          Randevularımı Gör
          <Icon name="arrowRight" />
        </Button>
        <Button size="lg" className="gap-2.5 text-[14px]" onClick={() => addToCalendar(appointment)}>
          <Icon name="calendarPlus" />
          Takvime Ekle
        </Button>
      </div>
    </div>
  );
}
