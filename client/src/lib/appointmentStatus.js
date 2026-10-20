export const STATUS_META = {
  BOOKED: { label: "Randevu alındı", variant: "accent", icon: "calendarCheck" },
  COMPLETED: { label: "Tamamlandı", variant: "neutral", icon: "check" },
  CANCELLED: { label: "İptal edildi", variant: "outline", icon: "close" },
  NO_SHOW: { label: "Gelinmedi", variant: "neutral", icon: "ban" },
};

export function isInactiveStatus(status) {
  return status === "CANCELLED" || status === "NO_SHOW";
}
