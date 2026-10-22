"use client";

import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import Tag from "@/components/atoms/Tag";
import Stat from "@/components/molecules/Stat";
import AppointmentGate from "@/features/customer/appointments/components/AppointmentGate";
import { useAddToCalendar } from "@/features/customer/appointments/useAddToCalendar";
import { formatLongDate } from "@/lib/date";
import { formatDuration, formatPrice } from "@/lib/format";

export default function BookingSuccessPage({ appointmentId }) {
  return (
    <AppointmentGate appointmentId={appointmentId}>
      {(appointment) => <BookingSuccess appointment={appointment} />}
    </AppointmentGate>
  );
}

function BookingSuccess({ appointment }) {
  const addToCalendar = useAddToCalendar();

  const { salon, service } = appointment;

  return (
    <div role="status" className="page-container flex max-w-[760px] flex-col gap-5 pt-14">
      <span className="grid size-[56px] animate-rise place-items-center rounded-full bg-accent text-canvas shadow-md">
        <Icon name="check" size={30} />
      </span>
      <h1 className="text-[clamp(32px,4.4vw,52px)]">Randevunuz oluşturuldu.</h1>
      <p className="max-w-[56ch] text-[16px] text-neutral-700">
        {salon.name} kuaförüne bildirim gönderildi. Randevunun tüm ayrıntılarını Randevularım sayfasında bulabilirsin.
      </p>

      <div className="card flex flex-col gap-1 p-6">
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
