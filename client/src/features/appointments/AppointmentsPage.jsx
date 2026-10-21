"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import StateMessage from "@/components/molecules/StateMessage";
import Tabs from "@/components/molecules/Tabs";
import { toAppointmentView } from "@/features/appointments/appointmentView";
import AppointmentRow, { AppointmentRowSkeleton } from "@/features/appointments/components/AppointmentRow";
import CancelAppointmentDialog from "@/features/appointments/components/CancelAppointmentDialog";
import { api, getErrorMessage } from "@/lib/api";

const LIST_LIMIT = 50;

export default function AppointmentsPage({ initialTab = "upcoming" }) {
  const [tab, setTab] = useState(initialTab);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [state, setState] = useState({ status: "loading", upcoming: [], past: [], counts: { upcoming: 0, past: 0 }, error: null });

  const loadAppointments = useCallback(async () => {
    try {
      const [upcoming, past] = await Promise.all([
        api.get("/appointments", { params: { scope: "upcoming", limit: LIST_LIMIT } }),
        api.get("/appointments", { params: { scope: "past", limit: LIST_LIMIT } }),
      ]);
      setState({
        status: "success",
        upcoming: upcoming.items.map(toAppointmentView),
        past: past.items.map(toAppointmentView),
        counts: { upcoming: upcoming.pagination.total, past: past.pagination.total },
        error: null,
      });
    } catch (error) {
      setState((current) => ({ ...current, status: "error", error: getErrorMessage(error) }));
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const list = state[tab];

  return (
    <div className="page-container max-w-[1080px] pt-8">
      <h1 className="mb-5 text-[clamp(30px,3.6vw,44px)]">Randevularım</h1>
      <Tabs
        label="Randevular"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "upcoming", label: `Yaklaşan (${state.counts.upcoming})` },
          { value: "past", label: `Geçmiş (${state.counts.past})` },
        ]}
        className="mb-2"
      />

      {state.status === "loading" ? (
        <div aria-busy="true" aria-label="Randevular yükleniyor">
          {[1, 2, 3].map((row) => (
            <AppointmentRowSkeleton key={row} />
          ))}
        </div>
      ) : state.status === "error" ? (
        <StateMessage role="alert" icon="alert" tone="accent" title="Randevular yüklenemedi." description={state.error} className="mt-4">
          <Button onClick={loadAppointments}>Tekrar dene</Button>
        </StateMessage>
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

      {cancelTarget && (
        <CancelAppointmentDialog
          appointment={cancelTarget}
          onCancelled={loadAppointments}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
