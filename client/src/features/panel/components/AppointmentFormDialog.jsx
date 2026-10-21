"use client";

import { useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import { Input, Select, Textarea } from "@/components/atoms/Input";
import Dialog, { DialogActions, DialogTitle } from "@/components/molecules/Dialog";
import Field from "@/components/molecules/Field";
import { useToast } from "@/components/organisms/ToastProvider";
import { usePanel } from "@/features/panel/PanelProvider";
import { getOpenDates } from "@/features/panel/scheduling";
import { useNotifications } from "@/features/notifications/NotificationsProvider";
import { api, getErrorMessage } from "@/lib/api";
import { TODAY } from "@/lib/clock";
import { cn } from "@/lib/cn";
import { formatDayWithWeekday } from "@/lib/date";
import { formatDuration, formatPrice } from "@/lib/format";

const DATE_OPTION_COUNT = 24;
const TITLE_ID = "appointment-form-title";

export default function AppointmentFormDialog({ draft, onClose }) {
  const { salon, services, hours, closedDays, saveAppointment } = usePanel();
  const { reloadNotifications } = useNotifications();
  const { showToast } = useToast();
  const dateOptions = getOpenDates(hours, closedDays, DATE_OPTION_COUNT);

  const [form, setForm] = useState({
    customer: draft.customer ?? "",
    phone: draft.phone ?? "",
    serviceId: draft.serviceId ?? services[0]?.id,
    date: draft.date && dateOptions.includes(draft.date) ? draft.date : dateOptions[0],
    time: draft.time ?? null,
    note: draft.note ?? "",
  });
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const editing = Boolean(draft.id);
  const onlineBooking = editing && draft.source === "online";
  const service = services.find((item) => item.id === form.serviceId);

  useEffect(() => {
    if (!form.serviceId || !form.date) return undefined;

    let ignore = false;
    setSlotsLoading(true);
    api
      .get(`/salons/${salon.id}/availability`, {
        params: { serviceId: form.serviceId, date: form.date, ...(draft.id && { excludeAppointmentId: draft.id }) },
      })
      .then((data) => !ignore && setSlots(data.slots.filter((slot) => slot.available).map((slot) => slot.time)))
      .catch(() => !ignore && setSlots([]))
      .finally(() => !ignore && setSlotsLoading(false));

    return () => {
      ignore = true;
    };
  }, [salon.id, form.serviceId, form.date, draft.id]);

  const selectedTime = slots.includes(form.time) ? form.time : null;

  const errors = {
    customer: submitted && !form.customer.trim(),
    phone: submitted && !onlineBooking && !form.phone.trim(),
    time: submitted && !selectedTime,
  };

  const update = (changes) => setForm((current) => ({ ...current, ...changes }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!form.customer.trim() || (!onlineBooking && !form.phone.trim()) || !selectedTime || saving) return;

    setSaving(true);
    setError(null);
    try {
      await saveAppointment({
        ...form,
        id: draft.id,
        time: selectedTime,
        customer: form.customer.trim(),
        phone: form.phone.trim(),
        note: form.note.trim(),
      });
      showToast(editing ? "Randevu güncellendi. Müşteriye bildirim gönderildi." : "Randevu oluşturuldu.");
      reloadNotifications();
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setSaving(false);
    }
  };

  if (!service) {
    return (
      <Dialog size="md" titleId={TITLE_ID} onClose={onClose}>
        <DialogTitle id={TITLE_ID}>Yeni randevu</DialogTitle>
        <p className="text-[14px] text-neutral-700">Randevu oluşturmak için önce en az bir aktif hizmet ekle.</p>
        <DialogActions>
          <Button onClick={onClose}>Kapat</Button>
          <Button variant="primary" href="/panel/hizmetler" onClick={onClose}>
            Hizmetlere git
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog as="form" size="md" titleId={TITLE_ID} onClose={onClose} onSubmit={handleSubmit} noValidate>
      <div className="flex items-center justify-between">
        <DialogTitle id={TITLE_ID}>{editing ? "Randevuyu düzenle" : "Yeni randevu"}</DialogTitle>
        <Button variant="plain" size="icon" aria-label="Kapat" onClick={onClose}>
          <Icon name="close" />
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
        <Field label="Müşteri adı *" htmlFor="appointment-customer" error={errors.customer && "Müşteri adı gerekli."}>
          <Input
            id="appointment-customer"
            value={form.customer}
            onChange={(event) => update({ customer: event.target.value })}
            aria-invalid={errors.customer}
            disabled={onlineBooking}
          />
        </Field>
        <Field label="Telefon *" htmlFor="appointment-phone" error={errors.phone && "Telefon gerekli."}>
          <Input
            id="appointment-phone"
            type="tel"
            value={form.phone}
            onChange={(event) => update({ phone: event.target.value })}
            placeholder="05xx xxx xx xx"
            aria-invalid={errors.phone}
            disabled={onlineBooking}
          />
        </Field>
        <Field label="Hizmet" htmlFor="appointment-service">
          <Select
            id="appointment-service"
            value={form.serviceId}
            onChange={(event) => update({ serviceId: event.target.value, time: null })}
          >
            {services.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {formatDuration(item.duration)} · {formatPrice(item.price)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tarih" htmlFor="appointment-date">
          <Select id="appointment-date" value={form.date} onChange={(event) => update({ date: event.target.value, time: null })}>
            {dateOptions.map((date) => (
              <option key={date} value={date}>
                {formatDayWithWeekday(date)}
                {date === TODAY ? " (bugün)" : ""}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Saat"
        hint={slotsLoading ? formatDuration(service.duration) : `${formatDuration(service.duration)} · ${slots.length} uygun başlangıç`}
        error={errors.time && slots.length > 0 && "Bir saat seç."}
      >
        {slotsLoading ? (
          <div className="border border-dashed border-line p-3.5 text-[13px] text-neutral-700">Uygun saatler yükleniyor…</div>
        ) : slots.length === 0 ? (
          <div className="border border-dashed border-line p-3.5 text-[13px] text-neutral-700">
            Bu tarihte seçili hizmet için uygun saat yok. Başka bir tarih seç.
          </div>
        ) : (
          <div role="group" aria-label="Saat" className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-1.5">
            {slots.map((time) => (
              <button
                key={time}
                type="button"
                aria-pressed={selectedTime === time}
                onClick={() => update({ time })}
                className={cn(
                  "h-[38px] border text-[13px] font-bold transition-colors",
                  selectedTime === time ? "border-accent bg-accent text-canvas" : "border-line hover:border-ink",
                )}
              >
                {time}
              </button>
            ))}
          </div>
        )}
      </Field>

      <Field label="Not" htmlFor="appointment-note">
        <Textarea
          id="appointment-note"
          value={form.note}
          onChange={(event) => update({ note: event.target.value })}
          placeholder="Örn. Hassas saç derisi"
          className="min-h-[70px]"
        />
      </Field>

      {error && (
        <p role="alert" className="text-[13px] text-accent-700">
          {error}
        </p>
      )}

      <p className="flex gap-2 text-[12px] text-neutral-700">
        <Icon name="info" size={14} className="mt-0.5" />
        {onlineBooking
          ? "Online alınan randevularda müşteri bilgileri değiştirilemez; müşteriye bildirim gider."
          : "Randevu doğrudan oluşturulur."}
      </p>

      <DialogActions>
        <Button onClick={onClose}>Vazgeç</Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Kaydediliyor…" : editing ? "Değişiklikleri kaydet" : "Randevuyu oluştur"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
