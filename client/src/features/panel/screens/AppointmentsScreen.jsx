"use client";

import { useMemo, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import SearchInput from "@/components/molecules/SearchInput";
import StateMessage from "@/components/molecules/StateMessage";
import Tabs from "@/components/molecules/Tabs";
import QueryState from "@/components/organisms/QueryState";
import { usePanel } from "@/features/panel/PanelProvider";
import { usePanelAppointments } from "@/features/panel/hooks/usePanelAppointments";
import AppointmentCards from "@/features/panel/components/AppointmentCards";
import AppointmentTable from "@/features/panel/components/AppointmentTable";
import { useAppointmentActions } from "@/features/panel/useAppointmentActions";
import { TODAY } from "@/lib/clock";
import { cn } from "@/lib/cn";
import { useSearchFilter } from "@/lib/hooks";

const chronological = (a, b) => a.date.localeCompare(b.date) || a.start - b.start;

const TABS = [
  { value: "today", label: "Bugün", filter: (item) => item.date === TODAY, sort: chronological },
  { value: "upcoming", label: "Yaklaşan", filter: (item) => item.status === "BOOKED" && item.date >= TODAY, sort: chronological },
  { value: "past", label: "Geçmiş", filter: (item) => item.date < TODAY || item.status !== "BOOKED", sort: (a, b) => chronological(b, a) },
  { value: "all", label: "Tümü", filter: () => true, sort: chronological },
];

const getSearchFields = (item) => [item.customer, item.phone, item.service.name, item.reference];

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
