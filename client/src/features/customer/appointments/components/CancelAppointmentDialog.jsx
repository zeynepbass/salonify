"use client";

import { useId, useState } from "react";
import { Select } from "@/components/atoms/Input";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
import ErrorNotice from "@/components/molecules/ErrorNotice";
import Field from "@/components/molecules/Field";
import { useToast } from "@/components/organisms/ToastProvider";
import { cancellationReasons } from "@/data/catalog";
import { useCancelAppointment } from "@/features/customer/appointments/hooks/useAppointment";
import { formatLongDate } from "@/lib/date";

export default function CancelAppointmentDialog({ appointment, onCancelled, onClose }) {
  const reasonId = useId();
  const { showToast } = useToast();
  const [reason, setReason] = useState("");
  const cancellation = useCancelAppointment({
    onSuccess: (cancelled) => {
      showToast("Randevun iptal edildi. Kuaföre bildirim gönderildi.");
      onCancelled?.(cancelled);
      onClose();
    },
  });
  const cancelling = cancellation.isPending;

  const confirm = () => cancellation.mutate({ appointmentId: appointment.id, reason });

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
      <ErrorNotice error={cancellation.error} className="mt-3" />
    </ConfirmDialog>
  );
}
