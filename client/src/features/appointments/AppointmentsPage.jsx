"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import StateMessage from "@/components/molecules/StateMessage";
import Tabs from "@/components/molecules/Tabs";
import { useAppointments } from "@/features/appointments/AppointmentsProvider";
import { splitAppointments } from "@/features/appointments/appointmentView";
import AppointmentRow, { AppointmentRowSkeleton } from "@/features/appointments/components/AppointmentRow";
import CancelAppointmentDialog from "@/features/appointments/components/CancelAppointmentDialog";
import { useInitialLoading } from "@/lib/hooks";

export default function AppointmentsPage({ initialTab = "upcoming" }) {
  const { appointments } = useAppointments();
  const [tab, setTab] = useState(initialTab);
  const [cancelTarget, setCancelTarget] = useState(null);
  const loading = useInitialLoading();

  const groups = splitAppointments(appointments);
  const list = groups[tab];

  return (
    <div className="page-container max-w-[1080px] pt-8">
      <h1 className="mb-5 text-[clamp(30px,3.6vw,44px)]">Randevularım</h1>
      <Tabs
        label="Randevular"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "upcoming", label: `Yaklaşan (${groups.upcoming.length})` },
          { value: "past", label: `Geçmiş (${groups.past.length})` },
        ]}
        className="mb-2"
      />

      {loading ? (
        <div aria-busy="true" aria-label="Randevular yükleniyor">
          {[1, 2, 3].map((row) => (
            <AppointmentRowSkeleton key={row} />
          ))}
        </div>
      ) : list.length === 0 ? (
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
      ) : (
        <div className="flex flex-col">
          {list.map((appointment) => (
            <AppointmentRow key={appointment.id} appointment={appointment} onCancel={setCancelTarget} />
          ))}
        </div>
      )}

      {cancelTarget && <CancelAppointmentDialog appointment={cancelTarget} onClose={() => setCancelTarget(null)} />}
    </div>
  );
}
