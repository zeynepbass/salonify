import { formatRelativeTime } from "@/lib/date";

const TYPES = {
  APPOINTMENT_CREATED: "booked",
  APPOINTMENT_UPDATED: "updated",
  APPOINTMENT_CANCELLED: "cancelled",
  APPOINTMENT_COMPLETED: "completed",
  REVIEW_REQUESTED: "review",
  REVIEW_PUBLISHED: "review",
};

function getCustomerHref({ type, appointment }) {
  if (!appointment) return null;
  return type === "REVIEW_REQUESTED" ? `/randevularim/${appointment}/degerlendir` : `/randevularim/${appointment}`;
}

export function toNotificationView(notification, { audience = "customer" } = {}) {
  const forSalon = audience === "salon";
  const reviewPublished = notification.type === "REVIEW_PUBLISHED";

  return {
    id: notification.id,
    type: TYPES[notification.type] ?? "reminder",
    title: notification.title,
    body: notification.body,
    time: formatRelativeTime(notification.createdAt),
    unread: !notification.isRead,
    appointmentId: forSalon && !reviewPublished ? notification.appointment : null,
    href: forSalon ? (reviewPublished ? "/panel/portfoy" : null) : getCustomerHref(notification),
  };
}
