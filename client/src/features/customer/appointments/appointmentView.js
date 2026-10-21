import { isInactiveStatus } from "@/lib/appointmentStatus";

export function toAppointmentView(appointment) {
  const completed = appointment.status === "COMPLETED";

  return {
    id: appointment.id,
    reference: appointment.reference,
    date: appointment.date,
    time: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
    notes: appointment.notes,
    salon: appointment.salon,
    service: {
      id: appointment.service,
      name: appointment.serviceName,
      duration: appointment.duration,
      price: appointment.price,
    },
    upcoming: appointment.status === "BOOKED",
    inactive: isInactiveStatus(appointment.status),
    canReview: completed && !appointment.isReviewed,
    reviewed: completed && appointment.isReviewed,
  };
}
