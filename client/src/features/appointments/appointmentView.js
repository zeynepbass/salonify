import { isInactiveStatus } from "@/lib/appointmentStatus";
import { getSalon, getService } from "@/lib/catalog";

export function toAppointmentView(appointment) {
  const salon = getSalon(appointment.salonId);
  const service = getService(appointment.serviceId);
  const upcoming = appointment.status === "BOOKED";
  const completed = appointment.status === "COMPLETED";

  return {
    ...appointment,
    salon,
    service,
    upcoming,
    inactive: isInactiveStatus(appointment.status),
    canReview: completed && !appointment.reviewed,
    reviewed: completed && appointment.reviewed,
  };
}

export function splitAppointments(appointments) {
  const views = appointments.map(toAppointmentView);
  const byDate = (a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);

  return {
    upcoming: views.filter((item) => item.upcoming).sort(byDate),
    past: views.filter((item) => !item.upcoming).sort((a, b) => byDate(b, a)),
  };
}
