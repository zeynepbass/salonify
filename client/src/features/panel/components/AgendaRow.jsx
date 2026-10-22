import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import StatusTag from "@/components/molecules/StatusTag";
import { cn } from "@/lib/cn";
import { formatDuration, formatPrice } from "@/lib/format";

export default function AgendaRow({ appointment, completing, onView, onComplete }) {
  const { service } = appointment;

  return (
    <div className={cn("flex flex-wrap items-center gap-4 border-b border-line py-3.5", appointment.inactive && "opacity-60")}>
      <div className="w-16 flex-none">
        <div className="text-[18px] font-extrabold">{appointment.time}</div>
        <div className="text-[12px] text-neutral-700">– {appointment.endTime}</div>
      </div>
      <div className="min-w-0 flex-[1_1_200px]">
        <div className="font-bold">{appointment.customer}</div>
        <div className="text-[13px] text-neutral-700">
          {service.name} · {formatDuration(service.duration)} · {formatPrice(service.price)}
        </div>
      </div>
      <StatusTag status={appointment.status} />
      <div className="flex gap-1.5">
        {appointment.canComplete && (
          <Button className="gap-1.5" disabled={completing} onClick={onComplete}>
            <Icon name="check" size={14} />
            Tamamlandı
          </Button>
        )}
        <Button variant="ghost" aria-label={`${appointment.customer} randevusunu görüntüle`} onClick={onView}>
          Görüntüle
        </Button>
      </div>
    </div>
  );
}
