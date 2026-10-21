"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import SegmentedControl from "@/components/molecules/SegmentedControl";
import { usePanel } from "@/features/dashboard/PanelProvider";
import CalendarDayView from "@/features/dashboard/components/CalendarDayView";
import CalendarWeekView from "@/features/dashboard/components/CalendarWeekView";
import { getBusyRanges, getDayBounds, getGridRange } from "@/features/dashboard/scheduling";
import { usePanelAppointments } from "@/features/dashboard/usePanelAppointments";
import { TODAY } from "@/lib/clock";
import { addDays, formatDayMonth, formatDayWithWeekday, getDateParts, startOfWeek } from "@/lib/date";

const VIEW_OPTIONS = [
  { value: "day", label: "Gün" },
  { value: "week", label: "Hafta" },
];

const LEGEND = [
  { label: "Boş", className: "border border-dashed border-neutral-500" },
  { label: "Dolu", className: "border border-ink bg-surface" },
  { label: "Bloklu", className: "stripes-muted [--stripe:3px]" },
  { label: "Tamamlandı", className: "bg-neutral-200" },
];

export default function CalendarScreen() {
  const panel = usePanel();
  const appointments = usePanelAppointments();
  const [view, setView] = useState("day");
  const [date, setDate] = useState(TODAY);

  const range = getGridRange(panel.hours);
  const weekStart = startOfWeek(date);
  const step = view === "day" ? 1 : 7;

  const title =
    view === "day"
      ? `${formatDayWithWeekday(date)}, ${getDateParts(date).year}`
      : `${formatDayMonth(weekStart)} – ${formatDayMonth(addDays(weekStart, 6))} ${getDateParts(weekStart).year}`;

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(weekStart, index);
    const list = appointments.filter((item) => item.date === day);
    return {
      date: day,
      closed: getDayBounds(panel.hours, panel.closedDays, day).closed,
      appointments: list,
      activeCount: list.filter((item) => item.status !== "CANCELLED").length,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl label="Görünüm" options={VIEW_OPTIONS} value={view} onChange={setView} optionClassName="px-4 font-semibold" />
        <div className="flex gap-1">
          <Button size="icon" aria-label="Önceki" onClick={() => setDate(addDays(date, -step))}>
            <Icon name="chevronLeft" />
          </Button>
          <Button size="icon" aria-label="Sonraki" onClick={() => setDate(addDays(date, step))}>
            <Icon name="chevronRight" />
          </Button>
        </div>
        <Button onClick={() => setDate(TODAY)}>Bugün</Button>
        <strong className="text-[18px]">{title}</strong>
        <div className="flex flex-wrap gap-3.5 text-[12px] text-neutral-700 lg:ml-auto">
          {LEGEND.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className={`size-3.5 ${item.className}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {view === "day" ? (
        <CalendarDayView
          date={date}
          range={range}
          bounds={getDayBounds(panel.hours, panel.closedDays, date)}
          appointments={appointments.filter((item) => item.date === date)}
          busyRanges={getBusyRanges(panel.appointments, date)}
          selectedId={panel.selectedAppointmentId}
          onSelect={panel.openAppointment}
          onCreate={(time) => panel.openAppointmentForm({ date, time })}
        />
      ) : (
        <CalendarWeekView
          days={weekDays}
          range={range}
          today={TODAY}
          selectedId={panel.selectedAppointmentId}
          onSelect={panel.openAppointment}
          onOpenDay={(day) => {
            setDate(day);
            setView("day");
          }}
        />
      )}
    </div>
  );
}
