"use client";

import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import StatusTag from "@/components/molecules/StatusTag";
import { useAppointmentActions } from "@/features/panel/useAppointmentActions";
import { formatDayWithWeekday } from "@/lib/date";
import { formatDuration, formatPrice } from "@/lib/format";
import { useBodyScrollLock, useEscapeKey } from "@/lib/hooks";

const ACTION = { size: "md", align: "start", className: "gap-2.5 px-3" };

export default function AppointmentDrawer({ appointment, onClose }) {
  const actions = useAppointmentActions();
  const { service } = appointment;

  useEscapeKey(onClose);
  useBodyScrollLock();

  const details = [
    { label: "Hizmet", value: service.name },
    { label: "Fiyat", value: formatPrice(service.price) },
    { label: "Tarih", value: formatDayWithWeekday(appointment.date) },
    { label: "Saat", value: `${appointment.time} – ${appointment.endTime}` },
    { label: "Süre", value: formatDuration(service.duration) },
    { label: "Kaynak", value: appointment.source === "manual" ? "Manuel" : "Online" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-60 bg-neutral-900/40" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-drawer-title"
        className="fixed inset-y-0 right-0 z-61 flex w-[min(440px,100vw)] animate-rise flex-col overflow-auto bg-canvas shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="eyebrow text-neutral-700">Randevu detayı</span>
          <Button variant="plain" size="icon" aria-label="Kapat" onClick={onClose}>
            <Icon name="close" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div>
            <StatusTag status={appointment.status} />
            <h2 id="appointment-drawer-title" className="mt-2.5 mb-0.5 text-[28px]">
              {appointment.customer}
            </h2>
            {appointment.phone && (
              <a
                href={`tel:${appointment.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 text-[14px] hover:text-accent"
              >
                <Icon name="phone" size={14} />
                {appointment.phone}
              </a>
            )}
          </div>
          <dl className="grid grid-cols-2 border-t border-neutral-400">
            {details.map((item) => (
              <div key={item.label} className="border-b border-line py-3 pr-3">
                <dt className="text-[12px] text-neutral-700">{item.label}</dt>
                <dd className="mt-0.5 font-bold">{item.value}</dd>
              </div>
            ))}
          </dl>
          <div>
            <div className="text-[12px] text-neutral-700">Not</div>
            <div className="text-[14px]">{appointment.note || "—"}</div>
          </div>
          {appointment.locked && (
            <div className="flex gap-2 rounded-xl bg-surface p-3 text-[13px] text-neutral-700">
              <Icon name="lock" size={14} className="mt-0.5" />
              Bu randevu geçmişte kaldı veya kapandı; düzenlenemez.
            </div>
          )}
        </div>

        {(appointment.canComplete || appointment.canEdit) && (
          <div className="flex flex-col gap-2 border-t border-line px-5 py-4">
            {appointment.canComplete && (
              <>
                <Button variant="primary" {...ACTION} onClick={() => actions.complete(appointment)}>
                  <Icon name="checkCircle" />
                  Tamamlandı olarak işaretle
                </Button>
                <Button {...ACTION} onClick={() => actions.markNoShow(appointment)}>
                  <Icon name="ban" />
                  Müşteri gelmedi
                </Button>
              </>
            )}
            {appointment.canEdit && (
              <>
                <Button {...ACTION} onClick={() => actions.edit(appointment)}>
                  <Icon name="edit" />
                  Düzenle
                </Button>
                <Button variant="danger" {...ACTION} onClick={() => actions.requestCancel(appointment)}>
                  <Icon name="closeCircle" />
                  Randevuyu iptal et
                </Button>
              </>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
