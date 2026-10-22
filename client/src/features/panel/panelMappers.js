import { withScheduleState } from "@/features/panel/scheduling";

export function toPanelAppointment(appointment) {
  return withScheduleState({
    id: appointment.id,
    reference: appointment.reference,
    date: appointment.date,
    time: appointment.startTime,
    endTime: appointment.endTime,
    customer: appointment.customerName,
    phone: appointment.customerPhone ?? "",
    serviceId: appointment.service,
    service: { id: appointment.service, name: appointment.serviceName, duration: appointment.duration, price: appointment.price },
    status: appointment.status,
    source: String(appointment.source ?? "").toLowerCase(),
    note: appointment.notes ?? "",
  });
}

export function toPortfolioItem(item) {
  return {
    id: item.id,
    image: item.image,
    title: item.title ?? "",
    customer: item.customerName || "Salon",
    rating: item.rating,
    date: item.createdAt.slice(0, 10),
    consent: item.hasConsent,
    published: item.isPublished,
  };
}

export const replaceById = (list, item) => list.map((current) => (current.id === item.id ? item : current));

export const sortByDate = (list) => [...list].sort((a, b) => a.date.localeCompare(b.date));
