"use client";

import { useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import Spinner from "@/components/atoms/Spinner";
import Tag from "@/components/atoms/Tag";
import Stat from "@/components/molecules/Stat";
import AppointmentNotFound from "@/features/customer/appointments/components/AppointmentNotFound";
import { useAddToCalendar } from "@/features/customer/appointments/useAddToCalendar";
import { toAppointmentView } from "@/features/customer/appointments/appointmentView";
import { api } from "@/lib/api";
import { formatLongDate } from "@/lib/date";
import { formatDuration, formatPrice } from "@/lib/format";

export default function BookingSuccessPage({ appointmentId }) {
  const addToCalendar = useAddToCalendar();
  const [state, setState] = useState({ status: "loading", appointment: null });

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

  const { salon, service } = appointment;

  return (
    <div role="status" className="page-container flex max-w-[760px] flex-col gap-5 pt-14">
      <span className="grid size-[50px] place-items-center bg-accent text-canvas">
        <Icon name="check" size={30} />
      </span>
      <h1 className="text-[clamp(32px,4.4vw,52px)]">Randevunuz oluşturuldu.</h1>
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
