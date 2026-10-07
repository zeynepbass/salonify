"use client";

import { useToast } from "@/components/organisms/ToastProvider";
import { usePanel } from "@/features/dashboard/PanelProvider";
import { formatDayMonth } from "@/lib/date";

export function useAppointmentActions() {
  const { setAppointmentStatus, closeAppointment, closeConfirmation, requestConfirmation, openAppointmentForm } = usePanel();
  const { showToast } = useToast();

  const updateStatus = (appointment, status, message) => {
    setAppointmentStatus(appointment.id, status);
    closeAppointment();
    closeConfirmation();
    showToast(message);
  };

  return {
    complete: (appointment) =>
      updateStatus(
        appointment,
        "COMPLETED",
        `${appointment.customer} · ${appointment.service.name} tamamlandı. Müşteriden değerlendirme istendi.`,
      ),
    markNoShow: (appointment) => updateStatus(appointment, "NO_SHOW", `${appointment.customer} gelmedi olarak işaretlendi.`),
    edit: (appointment) =>
      openAppointmentForm({
        id: appointment.id,
        customer: appointment.customer,
        phone: appointment.phone,
        serviceId: appointment.serviceId,
        date: appointment.date,
        time: appointment.time,
        note: appointment.note,
      }),
    requestCancel: (appointment) =>
      requestConfirmation({
        title: "Randevu iptal edilsin mi?",
        body: `${appointment.customer} · ${appointment.service.name} · ${formatDayMonth(appointment.date)}, ${appointment.time}. Bu işlem geri alınamaz; müşteriye bildirim gönderilir ve saat tekrar müsait olur.`,
        confirmLabel: "Randevuyu iptal et",
        onConfirm: () => updateStatus(appointment, "CANCELLED", "Randevu iptal edildi. Müşteriye bildirim gönderildi."),
      }),
  };
}
