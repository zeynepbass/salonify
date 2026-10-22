import Button from "@/components/atoms/Button";
import StatusTag from "@/components/molecules/StatusTag";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/date";
import { formatPrice } from "@/lib/format";

export default function AppointmentCards({ appointments, onView, actions }) {
  return (
    <div className="flex flex-col gap-2.5 md:hidden">
      {appointments.map((appointment) => (
        <div key={appointment.id} className={cn("flex flex-col gap-2 rounded-xl bg-surface p-4", appointment.inactive && "opacity-60")}>
          <div className="flex justify-between gap-2">
            <strong>{appointment.customer}</strong>
            <StatusTag status={appointment.status} />
          </div>
          <div className="text-[13px]">
            {appointment.service.name} · {formatShortDate(appointment.date)} · {appointment.time} ·{" "}
            {formatPrice(appointment.service.price)}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button onClick={() => onView(appointment.id)}>Görüntüle</Button>
            {appointment.canEdit && <Button onClick={() => actions.edit(appointment)}>Düzenle</Button>}
            {appointment.canComplete && <Button onClick={() => actions.complete(appointment)}>Tamamlandı</Button>}
          </div>
        </div>
      ))}
    </div>
  );
}
