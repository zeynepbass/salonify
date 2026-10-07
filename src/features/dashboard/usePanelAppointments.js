"use client";

import { useMemo } from "react";
import { usePanel } from "@/features/dashboard/PanelProvider";
import { toAppointmentView } from "@/features/dashboard/scheduling";

export function usePanelAppointments() {
  const { appointments, services } = usePanel();

  return useMemo(() => appointments.map((item) => toAppointmentView(item, services)), [appointments, services]);
}
