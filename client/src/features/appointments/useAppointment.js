"use client";

import { useAppointments } from "@/features/appointments/AppointmentsProvider";
import { toAppointmentView } from "@/features/appointments/appointmentView";

export function useAppointment(id) {
  const { appointments } = useAppointments();
  const appointment = appointments.find((item) => item.id === id);
  return appointment ? toAppointmentView(appointment) : null;
}
