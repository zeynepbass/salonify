import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import StateMessage from "@/components/molecules/StateMessage";
import SalonSection from "@/features/customer/salon/components/SalonSection";
import { formatDuration, formatPrice } from "@/lib/format";

function ServiceItem({ service, bookingHref }) {
  return (
    <div className="flex flex-col gap-1.5 bg-surface p-5 transition-shadow duration-150 hover:shadow-md">
      <h3 className="text-[19px]">{service.name}</h3>
      <div className="flex items-center gap-1.5 text-[13px] text-neutral-700">
        <Icon name="clock" size={14} />
        {formatDuration(service.duration, { long: true })}
      </div>
      <div className="mt-3 text-[24px] font-extrabold">{formatPrice(service.price)}</div>
      <Button align="between" href={bookingHref} className="mt-2 py-2.5">
        Randevu Al
        <Icon name="arrowRight" />
      </Button>
    </div>
  );
}

export default function ServicesSection({ salonId, services }) {
  return (
    <SalonSection id="hizmetler" title="Hizmetler" className="pt-10">
      {services.length === 0 ? (
        <StateMessage icon="scissors" title="Bu salon henüz hizmet eklemedi." />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] gap-4">
          {services.map((service) => (
            <ServiceItem
              key={service.id}
              service={service}
              bookingHref={`/kuaforler/${salonId}/randevu?hizmet=${service.id}`}
            />
          ))}
        </div>
      )}
    </SalonSection>
  );
}
