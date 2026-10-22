"use client";

import PageSpinner from "@/components/molecules/PageSpinner";
import AppointmentNotFound from "@/features/customer/appointments/components/AppointmentNotFound";
import { useAppointment } from "@/features/customer/appointments/hooks/useAppointment";
import { getErrorMessage, isNotFound } from "@/lib/api";

export default function AppointmentGate({ appointmentId, children }) {
  const { data: appointment, isPending, error } = useAppointment(appointmentId);

  if (isPending) return <PageSpinner label="Randevu yükleniyor" />;
  if (!appointment) return <AppointmentNotFound description={isNotFound(error) ? undefined : getErrorMessage(error)} />;
  return children(appointment);
}
