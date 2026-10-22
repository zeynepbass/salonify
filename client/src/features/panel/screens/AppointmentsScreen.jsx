"use client";

import { useMemo, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import SearchInput from "@/components/molecules/SearchInput";
import StateMessage from "@/components/molecules/StateMessage";
import StatusTag from "@/components/molecules/StatusTag";
import { Cell, HeadCell } from "@/components/molecules/Table";
import Tabs from "@/components/molecules/Tabs";
import QueryState from "@/components/organisms/QueryState";
import { usePanel } from "@/features/panel/PanelProvider";
import { usePanelAppointments } from "@/features/panel/hooks/usePanelAppointments";
import { useAppointmentActions } from "@/features/panel/useAppointmentActions";
import { TODAY } from "@/lib/clock";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/date";
import { formatDuration, formatPrice } from "@/lib/format";
import { useSearchFilter } from "@/lib/hooks";

const chronological = (a, b) => a.date.localeCompare(b.date) || a.start - b.start;

const TABS = [
  { value: "today", label: "Bugün", filter: (item) => item.date === TODAY, sort: chronological },
  { value: "upcoming", label: "Yaklaşan", filter: (item) => item.status === "BOOKED" && item.date >= TODAY, sort: chronological },
  { value: "past", label: "Geçmiş", filter: (item) => item.date < TODAY || item.status !== "BOOKED", sort: (a, b) => chronological(b, a) },
  { value: "all", label: "Tümü", filter: () => true, sort: chronological },
];

const getSearchFields = (item) => [item.customer, item.phone, item.service.name, item.reference];


function AppointmentTable({ appointments, onView, actions }) {
  return (
    <div className="overflow-x-auto max-md:hidden">
      <table className="w-full min-w-[900px] border-collapse text-[14px]">
        <thead>
          <tr>
            {["Müşteri", "Hizmet", "Tarih", "Saat", "Süre", "Fiyat", "Durum"].map((heading) => (
              <HeadCell key={heading}>{heading}</HeadCell>
            ))}
            <HeadCell className="text-right">İşlemler</HeadCell>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id} className={cn(appointment.inactive && "opacity-60")}>
              <Cell>
                <div className="font-bold">{appointment.customer}</div>
                <div className="text-[12px] text-neutral-700">
                  {appointment.phone} · {appointment.source === "manual" ? "Manuel" : "Online"}
                </div>
              </Cell>
              <Cell>{appointment.service.name}</Cell>
              <Cell>{formatShortDate(appointment.date)}</Cell>
              <Cell className="font-bold">{appointment.time}</Cell>
              <Cell>{formatDuration(appointment.service.duration)}</Cell>
              <Cell>{formatPrice(appointment.service.price)}</Cell>
              <Cell>
                <StatusTag status={appointment.status} />
              </Cell>
              <Cell>
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
              </Cell>
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
        <div key={appointment.id} className={cn("flex flex-col gap-2 rounded-xl bg-surface p-4", appointment.inactive && "opacity-60")}>
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
  const appointmentsQuery = usePanelAppointments();

  return (
    <QueryState query={appointmentsQuery} errorTitle="Randevular yüklenemedi.">
      {(appointments) => <AppointmentList appointments={appointments} initialTab={initialTab} />}
    </QueryState>
  );
}

function AppointmentList({ appointments, initialTab }) {
  const panel = usePanel();
  const actions = useAppointmentActions();
  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState("");

  const { results: filteredAppointments, isStale } = useSearchFilter(appointments, query, getSearchFields);

  const tabCounts = useMemo(
    () => Object.fromEntries(TABS.map((item) => [item.value, filteredAppointments.filter(item.filter).length])),
    [filteredAppointments],
  );

  const activeTab = TABS.find((item) => item.value === tab) ?? TABS[0];
  const list = useMemo(
    () => filteredAppointments.filter(activeTab.filter).sort(activeTab.sort),
    [filteredAppointments, activeTab],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          label="Randevu filtresi"
          value={tab}
          onChange={setTab}
          tabs={TABS.map((item) => ({ value: item.value, label: `${item.label} (${tabCounts[item.value]})` }))}
          className="max-w-full"
        />
        <SearchInput value={query} onChange={setQuery} placeholder="Müşteri, telefon, hizmet ara" className="flex-[0_1_280px] max-sm:flex-1" />
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
        <div className={cn("flex flex-col gap-4 transition-opacity", isStale && "opacity-70")}>
          <AppointmentTable appointments={list} onView={panel.openAppointment} actions={actions} />
          <AppointmentCards appointments={list} onView={panel.openAppointment} actions={actions} />
          <p className="flex items-center gap-1.5 text-[12px] text-neutral-700">
            <Icon name="lock" size={14} />
            Geçmiş, tamamlanmış veya iptal edilmiş randevular düzenlenemez ve silinemez.
          </p>
        </div>
      )}
    </div>
  );
}
