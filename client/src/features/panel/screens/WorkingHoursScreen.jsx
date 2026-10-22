"use client";

import { useMemo, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import { Input, Select } from "@/components/atoms/Input";
import Field from "@/components/molecules/Field";
import QueryState from "@/components/organisms/QueryState";
import { useToast } from "@/components/organisms/ToastProvider";
import WeeklySchedule from "@/features/panel/components/WeeklySchedule";
import { useAddBlockedDate, usePanelSchedule, useRemoveBlockedDate, useSaveWorkingHours } from "@/features/panel/hooks/useSchedule";
import { getOpenDates, validateHours } from "@/features/panel/scheduling";
import { getResponseMessage } from "@/lib/api";
import { formatDayWithWeekday } from "@/lib/date";

const DATE_OPTION_COUNT = 30;

export default function WorkingHoursScreen() {
  const schedule = usePanelSchedule();

  return (
    <QueryState query={schedule} errorTitle="Çalışma saatleri yüklenemedi.">
      {() => <WorkingHours salonId={schedule.salonId} savedHours={schedule.hours} closedDays={schedule.closedDays} />}
    </QueryState>
  );
}

function WorkingHours({ salonId, savedHours, closedDays }) {
  const { showToast, showError } = useToast();
  const [draft, setDraft] = useState(null);
  const [date, setDate] = useState(null);
  const [note, setNote] = useState("");

  const hours = draft ?? savedHours;
  const dirty = draft !== null;
  const hoursError = useMemo(() => validateHours(hours), [hours]);
  const dateOptions = useMemo(() => getOpenDates(savedHours, closedDays, DATE_OPTION_COUNT), [savedHours, closedDays]);
  const selectedDate = dateOptions.includes(date) ? date : dateOptions[0];

  const saveHours = useSaveWorkingHours(salonId, {
    onSuccess: () => {
      setDraft(null);
      showToast("Çalışma saatleri kaydedildi.");
    },
    onError: showError,
  });
  const addClosedDay = useAddBlockedDate(salonId, {
    onSuccess: (saved) => {
      setNote("");
      showToast(
        saved.bookedAppointmentCount
          ? `Kapalı gün eklendi. O gün ${saved.bookedAppointmentCount} randevu var — iptal edilmesi gerekiyor.`
          : "Kapalı gün eklendi.",
      );
    },
    onError: showError,
  });
  const removeClosedDay = useRemoveBlockedDate(salonId, {
    onSuccess: (response) => showToast(getResponseMessage(response, "Kapalı gün kaldırıldı.")),
    onError: showError,
  });

  const updateHours = (weekday, changes) =>
    setDraft((current) => (current ?? savedHours).map((day) => (day.weekday === weekday ? { ...day, ...changes } : day)));

  const handleAddClosedDay = (event) => {
    event.preventDefault();
    if (!selectedDate || addClosedDay.isPending) return;
    addClosedDay.mutate({ date: selectedDate, note: note.trim() || "Kapalı" });
  };

  return (
    <div className="flex flex-wrap items-start gap-10">
      <section className="min-w-0 flex-[2_1_620px]">
        <h2 className="mb-3 text-[20px]">Haftalık program</h2>
        <WeeklySchedule hours={hours} onChange={updateHours} />
        {dirty && hoursError && (
          <p role="alert" className="mt-3 text-[13px] text-accent-700">
            {hoursError}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="md"
            className="px-[18px]"
            disabled={!dirty || Boolean(hoursError) || saveHours.isPending}
            onClick={() => saveHours.mutate(hours)}
          >
            {saveHours.isPending ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
          </Button>
          {dirty && (
            <Button size="md" disabled={saveHours.isPending} onClick={() => setDraft(null)}>
              Geri al
            </Button>
          )}
        </div>
        <p className="mt-2 text-[12px] text-neutral-700">
          Mevcut randevular etkilenmez; yeni saatler müşterilerin randevu alırken gördüğü uygun saatlere anında yansır.
        </p>
      </section>

      <section className="min-w-0 flex-[1_1_300px]">
        <h2 className="mb-3 text-[20px]">Özel kapalı günler</h2>
        <div className="border-t border-neutral-400">
          {closedDays.length === 0 && <p className="border-b border-line py-3 text-[13px] text-neutral-700">Tanımlı kapalı gün yok.</p>}
          {closedDays.map((day) => (
            <div key={day.id} className="flex items-center gap-3 border-b border-line py-3">
              <div className="flex-1">
                <div className="font-extrabold">{formatDayWithWeekday(day.date)}</div>
                <div className="text-[13px] text-neutral-700">Kapalı{day.note && ` · ${day.note}`}</div>
              </div>
              <Button
                variant="plain"
                size="icon"
                aria-label={`${formatDayWithWeekday(day.date)} kapalı gününü kaldır`}
                disabled={removeClosedDay.isPending}
                onClick={() => removeClosedDay.mutate(day.id)}
              >
                <Icon name="trash" />
              </Button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddClosedDay} className="mt-4 flex flex-col gap-2.5 rounded-xl bg-surface p-4">
          <Field label="Tarih" htmlFor="closed-day-date">
            <Select id="closed-day-date" value={selectedDate ?? ""} onChange={(event) => setDate(event.target.value)}>
              {dateOptions.map((option) => (
                <option key={option} value={option}>
                  {formatDayWithWeekday(option)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Açıklama" htmlFor="closed-day-note">
            <Input id="closed-day-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Örn. Eğitim günü" />
          </Field>
          <Button type="submit" align="start" disabled={!selectedDate || addClosedDay.isPending}>
            <Icon name="plus" />
            Kapalı gün ekle
          </Button>
          <p className="text-[12px] text-neutral-700">
            O günde randevu varsa önce iptal etmen istenir; müşterilere bildirim gider.
          </p>
        </form>
      </section>
    </div>
  );
}
