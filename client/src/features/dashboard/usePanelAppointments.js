"use client";

import { useMemo } from "react";
import { usePanel } from "@/features/dashboard/PanelProvider";
import { toAppointmentView } from "@/features/dashboard/scheduling";

export function usePanelAppointments() {
  const { appointments } = usePanel();

  return useMemo(() => appointments.map(toAppointmentView), [appointments]);
}
