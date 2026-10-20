"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Select } from "@/components/atoms/Input";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
import Field from "@/components/molecules/Field";
import { useToast } from "@/components/organisms/ToastProvider";
import { cancellationReasons } from "@/data/mock/appointments";
import { useAppointments } from "@/features/appointments/AppointmentsProvider";
import { formatLongDate } from "@/lib/date";

const CANCEL_MS = 700;

export default function CancelAppointmentDialog({ appointment, onClose }) {
  const reasonId = useId();
  const { cancelAppointment } = useAppointments();
  const { showToast } = useToast();
  const [cancelling, setCancelling] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const confirm = () => {
    setCancelling(true);
    timer.current = setTimeout(() => {
      cancelAppointment(appointment.id);
      showToast("Randevun iptal edildi. Kuaföre bildirim gönderildi.");
      onClose();
    }, CANCEL_MS);
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
        <Select id={reasonId} defaultValue="">
          <option value="">Seçiniz</option>
          {cancellationReasons.map((reason) => (
            <option key={reason}>{reason}</option>
          ))}
        </Select>
      </Field>
    </ConfirmDialog>
  );
}
