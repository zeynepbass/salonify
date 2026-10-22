import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import StatusTag from "@/components/molecules/StatusTag";
import { Cell, HeadCell } from "@/components/molecules/Table";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/date";
import { formatDuration, formatPrice } from "@/lib/format";

export default function AppointmentTable({ appointments, onView, actions }) {
  return (
    <div className="overflow-x-auto max-md:hidden">
      <table className="w-full min-w-[900px] border-collapse text-[14px]">
        <thead>
          <tr>
            {["Müşteri", "Hizmet", "Tarih", "Saat", "Süre", "Fiyat", "Durum"].map((heading) => (
              <HeadCell key={heading}>{heading}</HeadCell>
            ))}
            <HeadCell className="text-right">İşlemler</HeadCell>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id} className={cn(appointment.inactive && "opacity-60")}>
              <Cell>
                <div className="font-bold">{appointment.customer}</div>
                <div className="text-[12px] text-neutral-700">
                  {appointment.phone} · {appointment.source === "manual" ? "Manuel" : "Online"}
                </div>
              </Cell>
              <Cell>{appointment.service.name}</Cell>
              <Cell>{formatShortDate(appointment.date)}</Cell>
              <Cell className="font-bold">{appointment.time}</Cell>
              <Cell>{formatDuration(appointment.service.duration)}</Cell>
              <Cell>{formatPrice(appointment.service.price)}</Cell>
              <Cell>
                <StatusTag status={appointment.status} />
              </Cell>
              <Cell>
                <div className="flex justify-end gap-0.5">
                  <Button variant="plain" size="icon" title="Görüntüle" aria-label={`Görüntüle: ${appointment.customer}`} onClick={() => onView(appointment.id)}>
                    <Icon name="eye" />
                  </Button>
                  <Button
                    variant="plain"
                    size="icon"
                    title="Düzenle"
                    aria-label={`Düzenle: ${appointment.customer}`}
                    disabled={!appointment.canEdit}
                    onClick={() => actions.edit(appointment)}
                  >
                    <Icon name="edit" />
                  </Button>
                  <Button
                    variant="plain"
                    size="icon"
                    title="İptal"
                    aria-label={`İptal et: ${appointment.customer}`}
                    disabled={!appointment.canEdit}
                    className="text-accent-700"
                    onClick={() => actions.requestCancel(appointment)}
                  >
                    <Icon name="closeCircle" />
                  </Button>
                  <Button
                    variant="plain"
                    size="icon"
                    title="Tamamlandı"
                    aria-label={`Tamamlandı olarak işaretle: ${appointment.customer}`}
                    disabled={!appointment.canComplete}
                    onClick={() => actions.complete(appointment)}
                  >
                    <Icon name="checkCircle" />
                  </Button>
                </div>
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
