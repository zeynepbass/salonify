"use client";

import { useMemo } from "react";
import { usePanel } from "@/features/panel/PanelProvider";
import { toAppointmentView } from "@/features/panel/scheduling";

export function usePanelAppointments() {
  const { appointments } = usePanel();

  return useMemo(() => appointments.map(toAppointmentView), [appointments]);
}
