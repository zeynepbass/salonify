"use client";

import { useId, useState } from "react";
import { Select } from "@/components/atoms/Input";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
import Field from "@/components/molecules/Field";
import { useToast } from "@/components/organisms/ToastProvider";
import { cancellationReasons } from "@/data/catalog";
import { useNotifications } from "@/features/notifications/NotificationsProvider";
import { api, getErrorMessage } from "@/lib/api";
import { formatLongDate } from "@/lib/date";

export default function CancelAppointmentDialog({ appointment, onCancelled, onClose }) {
  const reasonId = useId();
  const { showToast } = useToast();
  const { reloadNotifications } = useNotifications();
  const [reason, setReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);

  const confirm = async () => {
    setCancelling(true);
    setError(null);
    try {
      const cancelled = await api.delete(`/appointments/${appointment.id}`, { data: reason ? { reason } : {} });
      showToast("Randevun iptal edildi. Kuaföre bildirim gönderildi.");
      onCancelled?.(cancelled);
      reloadNotifications();
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setCancelling(false);
    }
  };

  return (
    <ConfirmDialog
      title="Randevu iptal edilsin mi?"
      confirmLabel={cancelling ? "İptal ediliyor…" : "Randevuyu İptal Et"}
      busy={cancelling}
      onConfirm={confirm}
      onClose={onClose}
    >
      <p>
        <strong>{appointment.service.name}</strong> · {appointment.salon.name}
        <br />
        {formatLongDate(appointment.date)}, {appointment.time}
      </p>
      <p className="mt-3">Bu işlem geri alınamaz. Saat tekrar müsait olur ve kuaföre bildirim gönderilir.</p>
      <Field label="İptal nedeni (isteğe bağlı)" htmlFor={reasonId} className="mt-4 text-ink">
        <Select id={reasonId} value={reason} onChange={(event) => setReason(event.target.value)}>
          <option value="">Seçiniz</option>
          {cancellationReasons.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
      </Field>
      {error && (
        <p role="alert" className="mt-3 text-[13px] text-accent-700">
          {error}
        </p>
      )}
    </ConfirmDialog>
  );
}
