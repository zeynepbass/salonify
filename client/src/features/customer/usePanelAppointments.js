"use client";

import { useMemo } from "react";
import { usePanel } from "@/features/customer/PanelProvider";
import { toAppointmentView } from "@/features/customer/scheduling";

export function usePanelAppointments() {
  const { appointments } = usePanel();

  return useMemo(() => appointments.map(toAppointmentView), [appointments]);
}
