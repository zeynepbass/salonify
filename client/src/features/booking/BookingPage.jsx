"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import BackLink from "@/components/molecules/BackLink";
import MobileActionBar from "@/components/molecules/MobileActionBar";
import { services } from "@/data/mock/services";
import { useAppointments } from "@/features/appointments/AppointmentsProvider";
import { BOOKING_MONTHS, SLOT_INTERVAL, getBookingMonth, getDayAvailability, getSlots } from "@/features/booking/availability";
import BookingSteps from "@/features/booking/components/BookingSteps";
import BookingSummary from "@/features/booking/components/BookingSummary";
import DatePicker from "@/features/booking/components/DatePicker";
import ServicePicker from "@/features/booking/components/ServicePicker";
import SlotPicker from "@/features/booking/components/SlotPicker";
import { getService } from "@/lib/catalog";
import { formatLongDate } from "@/lib/date";
import { formatDuration, formatPrice } from "@/lib/format";

const SLOT_LOADING_MS = 450;
const SUBMIT_MS = 900;

const bookableServices = services.filter((service) => service.active);

function StepSection({ id, title, aside, children }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-[100px]">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={id} className="text-[20px]">
          {title}
        </h2>
        {aside && <span className="text-[13px] text-neutral-700">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

export default function BookingPage({ salon, initialServiceId }) {
  const router = useRouter();
  const { appointments, createAppointment } = useAppointments();
  const [serviceId, setServiceId] = useState(initialServiceId ?? null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    const scheduled = timers.current;
    return () => scheduled.forEach(clearTimeout);
  }, []);

  const service = serviceId ? getService(serviceId) : null;
  const { year, monthIndex } = getBookingMonth(monthOffset);

  const takenTimes = appointments
    .filter((item) => item.salonId === salon.id && item.date === date && item.status === "BOOKED")
    .map((item) => item.time);
  const slots = date ? getSlots(date, takenTimes) : [];
  const freeCount = slots.filter((slot) => slot.available).length;

  const dateLabel = date ? formatLongDate(date, { withWeekday: true }) : null;
  const canSubmit = Boolean(service && date && time);
  const currentStep = !service ? 0 : !date ? 1 : !time ? 2 : 3;

  const selectDate = (nextDate) => {
    setDate(nextDate);
    setTime(null);
    setSlotsLoading(true);
    timers.current.push(setTimeout(() => setSlotsLoading(false), SLOT_LOADING_MS));
  };

  const submit = () => {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    timers.current.push(
      setTimeout(() => {
        const appointment = createAppointment({ salonId: salon.id, serviceId, date, time });
        router.push(`/randevularim/${appointment.id}/basarili`);
      }, SUBMIT_MS),
    );
  };

  return (
    <div className="page-container pt-6">
      <BackLink href={`/kuaforler/${salon.id}`}>{salon.name}</BackLink>
      <h1 className="mt-2 mb-5 text-[clamp(28px,3.4vw,40px)]">Randevu al</h1>
      <BookingSteps current={currentStep} />

      <div className="flex flex-wrap items-start gap-10">
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-10">
          <StepSection id="adim-hizmet" title="1. Hizmet">
            <ServicePicker services={bookableServices} value={serviceId} onChange={setServiceId} labelledBy="adim-hizmet" />
          </StepSection>

          <StepSection id="adim-tarih" title="2. Tarih">
            <DatePicker
              year={year}
              monthIndex={monthIndex}
              value={date}
              getAvailability={getDayAvailability}
              onChange={selectDate}
              onPrevious={monthOffset > 0 ? () => setMonthOffset(monthOffset - 1) : undefined}
              onNext={monthOffset < BOOKING_MONTHS - 1 ? () => setMonthOffset(monthOffset + 1) : undefined}
            />
          </StepSection>

          <StepSection
            id="adim-saat"
            title="3. Müsait saat"
            aside={
              date && !slotsLoading
                ? `${dateLabel} · ${freeCount} boş saat`
                : `${SLOT_INTERVAL} dakikalık aralıklarla müsait saatler`
            }
          >
            <SlotPicker slots={slots} value={time} loading={slotsLoading} hasDate={Boolean(date)} onChange={setTime} />
          </StepSection>
        </div>

        <BookingSummary
          salon={salon}
          rows={[
            { label: "Hizmet", value: service?.name },
            { label: "Tarih", value: dateLabel },
            { label: "Saat", value: time },
            { label: "Süre", value: service && formatDuration(service.duration, { long: true }) },
          ]}
          total={service && formatPrice(service.price)}
          canSubmit={canSubmit}
          submitting={submitting}
          onSubmit={submit}
        />
      </div>

      <MobileActionBar
        kicker={service ? `${service.name} · ${time ?? "saat seç"}` : "Hizmet seç"}
        value={service ? formatPrice(service.price) : "—"}
      >
        <Button variant="primary" disabled={!canSubmit || submitting} onClick={submit} className="h-12 gap-2.5 px-[18px]">
          Oluştur
          <Icon name="arrowRight" />
        </Button>
      </MobileActionBar>
    </div>
  );
}
