"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import Spinner from "@/components/atoms/Spinner";
import BackLink from "@/components/molecules/BackLink";
import MobileActionBar from "@/components/molecules/MobileActionBar";
import { useAuth } from "@/features/customer/auth/AuthProvider";
import { BOOKING_MONTHS, SLOT_INTERVAL, createDayAvailability, getBookingMonth } from "@/features/customer/booking/availability";
import BookingSteps from "@/features/customer/booking/components/BookingSteps";
import BookingSummary from "@/features/customer/booking/components/BookingSummary";
import DatePicker from "@/features/customer/booking/components/DatePicker";
import ServicePicker from "@/features/customer/booking/components/ServicePicker";
import SlotPicker from "@/features/customer/booking/components/SlotPicker";
import { useNotifications } from "@/features/customer/notifications/NotificationsProvider";
import SalonNotFound from "@/features/customer/salon/SalonNotFound";
import { api, getErrorMessage, isNotFound } from "@/lib/api";
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
  const { reloadNotifications } = useNotifications();
  const [salonState, setSalonState] = useState({ status: "loading", salon: null, error: null });
  const [serviceId, setServiceId] = useState(initialServiceId ?? null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsVersion, setSlotsVersion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    api
      .get(`/salons/${salonId}`)
      .then((salon) => !ignore && setSalonState({ status: "success", salon, error: null }))
      .catch((requestError) => {
        if (ignore) return;
        setSalonState({ status: isNotFound(requestError) ? "not-found" : "error", salon: null, error: getErrorMessage(requestError) });
      });
    return () => {
      ignore = true;
    };
  }, [salonId]);

  const salon = salonState.salon;
  const services = salon?.services ?? [];
  const service = services.find((item) => item.id === serviceId) ?? null;

  useEffect(() => {
    if (!service || !date) return undefined;

    let ignore = false;
    setSlotsLoading(true);
    api
      .get(`/salons/${salonId}/availability`, { params: { serviceId: service.id, date } })
      .then((data) => !ignore && setSlots(data.slots))
      .catch((requestError) => {
        if (ignore) return;
        setSlots([]);
        setError(getErrorMessage(requestError));
      })
      .finally(() => !ignore && setSlotsLoading(false));

    return () => {
      ignore = true;
    };
  }, [salonId, service, date, slotsVersion]);

  if (salonState.status === "loading") {
    return (
      <div aria-busy="true" className="grid min-h-[50vh] place-items-center">
        <Spinner />
      </div>
    );
  }

  if (salonState.status === "not-found") return <SalonNotFound />;
  if (salonState.status === "error") return <SalonNotFound description={salonState.error} />;

  const hours = toWorkingHours(salon.workingHours);
  const getDayAvailability = createDayAvailability(hours, salon.blockedDates);
  const { year, monthIndex } = getBookingMonth(monthOffset);
  const visibleSlots = service && date ? slots : [];
  const freeCount = visibleSlots.filter((slot) => slot.available).length;

  const dateLabel = date ? formatLongDate(date, { withWeekday: true }) : null;
  const canSubmit = Boolean(service && date && time);
  const currentStep = !service ? 0 : !date ? 1 : !time ? 2 : 3;

  const selectService = (nextServiceId) => {
    setServiceId(nextServiceId);
    setTime(null);
    setError(null);
  };

  const selectDate = (nextDate) => {
    setDate(nextDate);
    setTime(null);
    setError(null);
  };

  const submit = async () => {
    if (!canSubmit || submitting) return;

    if (status !== "authenticated" || user.role !== "CUSTOMER") {
      router.push(`/giris?next=${encodeURIComponent(`${pathname}?hizmet=${service.id}`)}`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const appointment = await api.post("/appointments", { salonId: salon.id, serviceId: service.id, date, startTime: time });
      reloadNotifications();
      router.push(`/randevularim/${appointment.id}/basarili`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setTime(null);
      setSlotsVersion((version) => version + 1);
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container pt-6">
      <BackLink href={`/kuaforler/${salon.id}`}>{salon.name}</BackLink>
      <h1 className="mt-2 mb-5 text-[clamp(28px,3.4vw,40px)]">Randevu al</h1>
      <BookingSteps current={currentStep} />

      {error && (
        <p role="alert" className="mb-6 flex gap-2 bg-accent-100 p-3 text-[14px] text-accent-800">
          <Icon name="alert" size={16} className="mt-0.5" />
          {error}
        </p>
      )}

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
