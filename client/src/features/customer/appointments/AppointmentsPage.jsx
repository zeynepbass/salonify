"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import StateMessage from "@/components/molecules/StateMessage";
import QueryState from "@/components/organisms/QueryState";
import Tabs from "@/components/molecules/Tabs";
import AppointmentRow, { AppointmentRowSkeleton } from "@/features/customer/appointments/components/AppointmentRow";
import CancelAppointmentDialog from "@/features/customer/appointments/components/CancelAppointmentDialog";
import { useAppointments } from "@/features/customer/appointments/hooks/useAppointment";

export default function AppointmentsPage({ initialTab = "upcoming" }) {
  const [tab, setTab] = useState(initialTab);
  const [cancelTarget, setCancelTarget] = useState(null);
  const queries = { upcoming: useAppointments("upcoming"), past: useAppointments("past") };
  const activeQuery = queries[tab];
  const countLabel = (query) => (query.data ? ` (${query.data.total})` : "");

  return (
    <div className="page-container max-w-[1080px] pt-8">
      <h1 className="mb-5 text-[clamp(30px,3.6vw,44px)]">Randevularım</h1>
      <Tabs
        label="Randevular"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "upcoming", label: `Yaklaşan${countLabel(queries.upcoming)}` },
          { value: "past", label: `Geçmiş${countLabel(queries.past)}` },
        ]}
        className="mb-2"
      />

      <QueryState
        query={activeQuery}
        errorTitle="Randevular yüklenemedi."
        className="mt-4"
        loading={
          <div aria-busy="true" aria-label="Randevular yükleniyor">
            {[1, 2, 3].map((row) => (
              <AppointmentRowSkeleton key={row} />
            ))}
          </div>
        }
        isEmpty={(data) => data.appointments.length === 0}
        empty={
          <StateMessage
            icon="calendar"
            title={tab === "upcoming" ? "Yaklaşan randevunuz yok." : "Geçmiş randevunuz yok."}
            description="Yakınındaki kuaförleri keşfet ve randevunu birkaç adımda oluştur."
            className="mt-4"
          >
            <Button variant="primary" href="/kuaforler" className="gap-2.5">
              Kuaför keşfet
              <Icon name="arrowRight" />
            </Button>
          </StateMessage>
        }
      >
        {({ appointments }) => (
          <div className="flex flex-col">
            {appointments.map((appointment) => (
              <AppointmentRow key={appointment.id} appointment={appointment} onCancel={setCancelTarget} />
            ))}
          </div>
        )}
      </QueryState>

      {cancelTarget && (
        <CancelAppointmentDialog appointment={cancelTarget} onClose={() => setCancelTarget(null)} />
      )}
    </div>
  );
}
