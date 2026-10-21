"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import SearchInput from "@/components/molecules/SearchInput";
import StateMessage from "@/components/molecules/StateMessage";
import StatusTag from "@/components/molecules/StatusTag";
import Tabs from "@/components/molecules/Tabs";
import { usePanel } from "@/features/panel/PanelProvider";
import { useAppointmentActions } from "@/features/panel/useAppointmentActions";
import { usePanelAppointments } from "@/features/panel/usePanelAppointments";
import { TODAY } from "@/lib/clock";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/date";
import { formatDuration, formatPrice } from "@/lib/format";

const chronological = (a, b) => a.date.localeCompare(b.date) || a.start - b.start;

const TABS = [
  { value: "today", label: "Bugün", filter: (item) => item.date === TODAY, sort: chronological },
  { value: "upcoming", label: "Yaklaşan", filter: (item) => item.status === "BOOKED" && item.date >= TODAY, sort: chronological },
  { value: "past", label: "Geçmiş", filter: (item) => item.date < TODAY || item.status !== "BOOKED", sort: (a, b) => chronological(b, a) },
  { value: "all", label: "Tümü", filter: () => true, sort: chronological },
];

const HEAD_CELL = "eyebrow border-b-2 border-ink px-3 py-2.5 text-left text-neutral-700";
const CELL = "border-b border-line px-3 py-3";

function AppointmentTable({ appointments, onView, actions }) {
  return (
    <div className="overflow-x-auto max-md:hidden">
      <table className="w-full min-w-[900px] border-collapse text-[14px]">
        <thead>
          <tr>
            {["Müşteri", "Hizmet", "Tarih", "Saat", "Süre", "Fiyat", "Durum"].map((heading) => (
              <th key={heading} scope="col" className={HEAD_CELL}>
                {heading}
              </th>
            ))}
            <th scope="col" className={cn(HEAD_CELL, "text-right")}>
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id} className={cn(appointment.inactive && "opacity-60")}>
              <td className={CELL}>
                <div className="font-bold">{appointment.customer}</div>
                <div className="text-[12px] text-neutral-700">
                  {appointment.phone} · {appointment.source === "manual" ? "Manuel" : "Online"}
                </div>
              </td>
              <td className={CELL}>{appointment.service.name}</td>
              <td className={CELL}>{formatShortDate(appointment.date)}</td>
              <td className={cn(CELL, "font-bold")}>{appointment.time}</td>
              <td className={CELL}>{formatDuration(appointment.service.duration)}</td>
              <td className={CELL}>{formatPrice(appointment.service.price)}</td>
              <td className={CELL}>
                <StatusTag status={appointment.status} />
              </td>
              <td className={CELL}>
                <div className="flex justify-end gap-0.5">
                  <Button variant="plain" size="icon" title="Görüntüle" aria-label={`Görüntüle: ${appointment.customer}`} onClick={() => onView(appointment.id)}>
                    <Icon name="eye" />
                  </Button>
                  <Button
                    variant="plain"
                    size="icon"
                    title="Düzenle"
                    aria-label={`Düzenle: ${appointment.customer}`}
                    disabled={!appointment.canEdit}
                    onClick={() => actions.edit(appointment)}
                  >
                    <Icon name="edit" />
                  </Button>
                  <Button
                    variant="plain"
                    size="icon"
                    title="İptal"
                    aria-label={`İptal et: ${appointment.customer}`}
                    disabled={!appointment.canEdit}
                    className="text-accent-700"
                    onClick={() => actions.requestCancel(appointment)}
                  >
                    <Icon name="closeCircle" />
                  </Button>
                  <Button
                    variant="plain"
                    size="icon"
                    title="Tamamlandı"
                    aria-label={`Tamamlandı olarak işaretle: ${appointment.customer}`}
                    disabled={!appointment.canComplete}
                    onClick={() => actions.complete(appointment)}
                  >
                    <Icon name="checkCircle" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AppointmentCards({ appointments, onView, actions }) {
  return (
    <div className="flex flex-col gap-2.5 md:hidden">
      {appointments.map((appointment) => (
        <div key={appointment.id} className={cn("flex flex-col gap-2 bg-surface p-4", appointment.inactive && "opacity-60")}>
          <div className="flex justify-between gap-2">
            <strong>{appointment.customer}</strong>
            <StatusTag status={appointment.status} />
          </div>
          <div className="text-[13px]">
            {appointment.service.name} · {formatShortDate(appointment.date)} · {appointment.time} ·{" "}
            {formatPrice(appointment.service.price)}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button onClick={() => onView(appointment.id)}>Görüntüle</Button>
            {appointment.canEdit && <Button onClick={() => actions.edit(appointment)}>Düzenle</Button>}
            {appointment.canComplete && <Button onClick={() => actions.complete(appointment)}>Tamamlandı</Button>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AppointmentsScreen({ initialTab = "today" }) {
  const panel = usePanel();
  const actions = useAppointmentActions();
  const appointments = usePanelAppointments();
  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState("");

  const activeTab = TABS.find((item) => item.value === tab);
  const list = appointments.filter(activeTab.filter).sort(activeTab.sort);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          label="Randevu filtresi"
          value={tab}
          onChange={setTab}
          tabs={TABS.map((item) => ({ value: item.value, label: `${item.label} (${appointments.filter(item.filter).length})` }))}
          className="max-w-full"
        />
        <SearchInput value={query} onChange={setQuery} placeholder="Müşteri ara" className="flex-[0_1_280px] max-sm:flex-1" />
      </div>

      {list.length === 0 ? (
        <StateMessage
          icon="calendar"
          title={query ? "Aramanla eşleşen randevu yok." : "Bu filtrede randevu yok."}
          className="gap-2.5"
        >
          <Button variant="primary" onClick={() => panel.openAppointmentForm()}>
            <Icon name="plus" />
            Randevu ekle
          </Button>
        </StateMessage>
      ) : (
        <>
          <AppointmentTable appointments={list} onView={panel.openAppointment} actions={actions} />
          <AppointmentCards appointments={list} onView={panel.openAppointment} actions={actions} />
          <p className="flex items-center gap-1.5 text-[12px] text-neutral-700">
            <Icon name="lock" size={14} />
            Geçmiş, tamamlanmış veya iptal edilmiş randevular düzenlenemez ve silinemez.
          </p>
        </>
      )}
    </div>
  );
}
