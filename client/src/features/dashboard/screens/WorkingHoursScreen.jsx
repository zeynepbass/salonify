"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import { Input, Select } from "@/components/atoms/Input";
import Switch from "@/components/atoms/Switch";
import Field from "@/components/molecules/Field";
import { useToast } from "@/components/organisms/ToastProvider";
import { usePanel } from "@/features/dashboard/PanelProvider";
import { getOpenDates } from "@/features/dashboard/scheduling";
import { getErrorMessage } from "@/lib/api";
import { WEEKDAYS, formatDayWithWeekday } from "@/lib/date";

const HEAD_CELL = "eyebrow border-b-2 border-ink px-3 py-2.5 text-left text-neutral-700";
const CELL = "border-b border-line px-3 py-3";
const DATE_OPTION_COUNT = 30;

function TimeInput({ label, ...props }) {
  return <Input type="time" aria-label={label} className="w-[116px]" {...props} />;
}

function WeeklySchedule({ hours, onChange }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-[14px]">
        <thead>
          <tr>
            {["Gün", "Durum", "Açılış", "Kapanış", "Mola"].map((heading) => (
              <th key={heading} scope="col" className={HEAD_CELL}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((day) => {
            const name = WEEKDAYS[day.weekday];
            const set = (field) => (event) => onChange(day.weekday, { [field]: event.target.value });
            return (
              <tr key={day.weekday}>
                <th scope="row" className={`${CELL} text-left font-bold`}>
                  {name}
                </th>
                <td className={CELL}>
                  <div className="flex items-center gap-2">
                    <Switch checked={day.open} onChange={(open) => onChange(day.weekday, { open })} aria-label={`${name} açık`} />
                    <span className="text-[13px]">{day.open ? "Açık" : "Kapalı"}</span>
                  </div>
                </td>
                <td className={CELL}>
                  <TimeInput label={`${name} açılış`} value={day.start} disabled={!day.open} onChange={set("start")} />
                </td>
                <td className={CELL}>
                  <TimeInput label={`${name} kapanış`} value={day.end} disabled={!day.open} onChange={set("end")} />
                </td>
                <td className={CELL}>
                  <div className="flex items-center gap-1.5">
                    <TimeInput label={`${name} mola başlangıç`} value={day.breakStart} disabled={!day.open} onChange={set("breakStart")} />
                    <span>–</span>
                    <TimeInput label={`${name} mola bitiş`} value={day.breakEnd} disabled={!day.open} onChange={set("breakEnd")} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function WorkingHoursScreen() {
  const { hours, closedDays, updateHours, saveHours, addClosedDay, removeClosedDay } = usePanel();
  const { showToast } = useToast();
  const dateOptions = getOpenDates(hours, closedDays, DATE_OPTION_COUNT);
  const [date, setDate] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedDate = dateOptions.includes(date) ? date : dateOptions[0];
  const showError = (error) => showToast(getErrorMessage(error), { tone: "error" });

  const handleSaveHours = async () => {
    setSaving(true);
    try {
      await saveHours();
      showToast("Çalışma saatleri kaydedildi.");
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddClosedDay = async (event) => {
    event.preventDefault();
    if (!selectedDate) return;

    try {
      const saved = await addClosedDay({ date: selectedDate, note: note.trim() || "Kapalı" });
      setNote("");
      showToast(
        saved.bookedAppointmentCount
          ? `Kapalı gün eklendi. O gün ${saved.bookedAppointmentCount} randevu var — iptal edilmesi gerekiyor.`
          : "Kapalı gün eklendi.",
      );
    } catch (error) {
      showError(error);
    }
  };

  const handleRemoveClosedDay = async (day) => {
    try {
      await removeClosedDay(day.id);
      showToast("Kapalı gün kaldırıldı.");
    } catch (error) {
      showError(error);
    }
  };

  return (
    <div className="flex flex-wrap items-start gap-10">
      <section className="min-w-0 flex-[2_1_620px]">
        <h2 className="mb-3 text-[20px]">Haftalık program</h2>
        <WeeklySchedule hours={hours} onChange={updateHours} />
        <Button variant="primary" size="md" className="mt-4 px-[18px]" disabled={saving} onClick={handleSaveHours}>
          {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
        </Button>
        <p className="mt-2 text-[12px] text-neutral-700">
          Mevcut randevular etkilenmez; yeni saatler müşteri tarafındaki boş slotlara anında yansır.
        </p>
      </section>

      <section className="min-w-0 flex-[1_1_300px]">
        <h2 className="mb-3 text-[20px]">Özel kapalı günler</h2>
        <div className="border-t-2 border-ink">
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
                onClick={() => handleRemoveClosedDay(day)}
              >
                <Icon name="trash" />
              </Button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddClosedDay} className="mt-4 flex flex-col gap-2.5 bg-surface p-4">
          <Field label="Tarih" htmlFor="closed-day-date">
            <Select id="closed-day-date" value={selectedDate} onChange={(event) => setDate(event.target.value)}>
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
          <Button type="submit" align="start">
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
