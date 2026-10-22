"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import BackLink from "@/components/molecules/BackLink";
import ErrorNotice from "@/components/molecules/ErrorNotice";
import MobileActionBar from "@/components/molecules/MobileActionBar";
import PageSpinner from "@/components/molecules/PageSpinner";
import { useAuth } from "@/features/shared/auth/AuthProvider";
import { BOOKING_MONTHS, SLOT_INTERVAL, createDayAvailability, getBookingMonth } from "@/features/customer/booking/availability";
import BookingSteps from "@/features/customer/booking/components/BookingSteps";
import BookingSummary from "@/features/customer/booking/components/BookingSummary";
import DatePicker from "@/features/customer/booking/components/DatePicker";
import ServicePicker from "@/features/customer/booking/components/ServicePicker";
import SlotPicker from "@/features/customer/booking/components/SlotPicker";
import { useBookAppointment } from "@/features/customer/booking/hooks/useBooking";
import { useAvailability } from "@/features/shared/availability/useAvailability";
import { useSalon } from "@/features/customer/salon/hooks/useSalon";
import SalonNotFound from "@/features/customer/salon/SalonNotFound";
import { getErrorMessage, isNotFound } from "@/lib/api";
import { formatLongDate } from "@/lib/date";
import { formatDuration, formatPrice } from "@/lib/format";
import { toWorkingHours } from "@/lib/schedule";

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

export default function BookingPage({ salonId, initialServiceId }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user } = useAuth();
  const salonQuery = useSalon(salonId);
  const [serviceId, setServiceId] = useState(initialServiceId ?? null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);

  const salon = salonQuery.data;
  const services = salon?.services ?? [];
  const service = services.find((item) => item.id === serviceId) ?? null;

  const slotsQuery = useAvailability(salonId, { serviceId: service?.id, date });
  const booking = useBookAppointment({
    onSuccess: (appointment) => router.push(`/randevularim/${appointment.id}/basarili`),
    onError: () => setTime(null),
  });

  if (salonQuery.isPending) return <PageSpinner label="Kuaför yükleniyor" />;
  if (salonQuery.isError) {
    return <SalonNotFound description={isNotFound(salonQuery.error) ? undefined : getErrorMessage(salonQuery.error)} />;
  }

  const hours = toWorkingHours(salon.workingHours);
  const getDayAvailability = createDayAvailability(hours, salon.blockedDates);
  const { year, monthIndex } = getBookingMonth(monthOffset);
  const slots = slotsQuery.data ?? [];
  const slotsLoading = slotsQuery.isFetching && !slotsQuery.data;
  const visibleSlots = service && date ? slots : [];
  const submitting = booking.isPending || booking.isSuccess;
  const freeCount = visibleSlots.filter((slot) => slot.available).length;

  const dateLabel = date ? formatLongDate(date, { withWeekday: true }) : null;
  const canSubmit = Boolean(service && date && time);
  const currentStep = !service ? 0 : !date ? 1 : !time ? 2 : 3;

  const selectService = (nextServiceId) => {
    setServiceId(nextServiceId);
    setTime(null);
    booking.reset();
  };

  const selectDate = (nextDate) => {
    setDate(nextDate);
    setTime(null);
    booking.reset();
  };

  const submit = () => {
    if (!canSubmit || submitting) return;

    if (status !== "authenticated" || user.role !== "CUSTOMER") {
      router.push(`/giris?next=${encodeURIComponent(`${pathname}?hizmet=${service.id}`)}`);
      return;
    }

    booking.mutate({ salonId: salon.id, serviceId: service.id, date, startTime: time });
  };

  return (
    <div className="page-container pt-6">
      <BackLink href={`/kuaforler/${salon.id}`}>{salon.name}</BackLink>
      <h1 className="mt-2 mb-5 text-[clamp(28px,3.4vw,40px)]">Randevu al</h1>
      <BookingSteps current={currentStep} />

      <ErrorNotice error={booking.error ?? slotsQuery.error} className="mb-6" />

      <div className="flex flex-wrap items-start gap-10">
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-10">
          <StepSection id="adim-hizmet" title="1. Hizmet">
            <ServicePicker services={services} value={serviceId} onChange={selectService} labelledBy="adim-hizmet" />
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
              service && date && !slotsLoading
                ? `${dateLabel} · ${freeCount} boş saat`
                : `${SLOT_INTERVAL} dakikalık aralıklarla müsait saatler`
            }
          >
            {date && !service ? (
              <p className="border border-dashed border-line px-5 py-7 text-[14px] text-neutral-700">
                Uygun saatleri görmek için önce bir hizmet seç.
              </p>
            ) : (
              <SlotPicker slots={visibleSlots} value={time} loading={slotsLoading} hasDate={Boolean(date)} onChange={setTime} />
            )}
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
