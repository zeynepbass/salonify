import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import Skeleton from "@/components/atoms/Skeleton";
import DateBadge from "@/components/molecules/DateBadge";
import StatusTag from "@/components/molecules/StatusTag";
import { cn } from "@/lib/cn";
import { formatDuration, formatPrice } from "@/lib/format";

export default function AppointmentRow({ appointment, onCancel }) {
  const { id, salon, service } = appointment;

  return (
    <article className={cn("flex flex-wrap items-center gap-5 border-b border-line py-5", appointment.inactive && "opacity-70")}>
      <DateBadge date={appointment.date} />
      <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <strong className="text-[18px]">{service.name}</strong>
          <StatusTag status={appointment.status} />
        </div>
        <div className="text-[14px]">{salon.name}</div>
        <div className="flex flex-wrap gap-3.5 text-[13px] text-neutral-700">
          <span className="flex items-center gap-[5px]">
            <Icon name="clock" size={14} />
            {appointment.time} · {formatDuration(service.duration)}
          </span>
          <span className="font-bold text-ink">{formatPrice(service.price)}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button href={`/randevularim/${id}`}>Detay</Button>
        {appointment.upcoming && (
          <Button variant="ghost" onClick={() => onCancel(appointment)}>
            İptal Et
          </Button>
        )}
        {appointment.canReview && (
          <Button variant="primary" href={`/randevularim/${id}/degerlendir`}>
            <Icon name="star" size={14} filled />
            Değerlendir
          </Button>
        )}
        {appointment.reviewed && (
          <span className="flex items-center gap-1.5 px-1 py-2 text-[13px] text-neutral-700">
            <Icon name="check" size={14} />
            Değerlendirildi
          </span>
        )}
        {appointment.inactive && (
          <Button variant="ghost" href={`/kuaforler/${salon.id}/randevu?hizmet=${service.id}`}>
            Tekrar randevu al
          </Button>
        )}
      </div>
    </article>
  );
}

export function AppointmentRowSkeleton() {
  return (
    <div className="flex gap-5 border-b border-line py-5">
      <Skeleton className="h-20 w-[72px]" />
      <div className="grid flex-1 content-center gap-2.5">
        <Skeleton className="h-[18px] w-2/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  );
}
