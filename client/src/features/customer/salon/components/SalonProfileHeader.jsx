import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import Tag from "@/components/atoms/Tag";
import { CURRENT_TIME, TODAY } from "@/lib/clock";
import { getDaySchedule, getOpeningStatus } from "@/lib/schedule";
import { formatRating } from "@/lib/format";

function ContactRow({ icon, children }) {
  return (
    <div className="flex gap-3 border-t border-line py-3 text-[14px] last:border-b">
      <Icon name={icon} className="text-neutral-600" />
      {children}
    </div>
  );
}

export default function SalonProfileHeader({ salon, hours, closedDays }) {
  const status = getOpeningStatus(hours, closedDays, TODAY, CURRENT_TIME);
  const today = getDaySchedule(hours, closedDays, TODAY);
  const thumbnails = salon.portfolio.slice(0, 4);

  return (
    <div className="mt-4 flex flex-wrap gap-10">
      <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-2">
        <ImagePlaceholder src={salon.coverImage} alt={salon.name} className="aspect-[4/3]" />
        {thumbnails.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {thumbnails.map((item) => (
              <ImagePlaceholder key={item.id} src={item.image} alt={item.title ?? ""} stripe={10} className="aspect-square" />
            ))}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Tag variant={status.open ? "accent" : "outline"} className="gap-1.5">
            <span className={status.open ? "size-1.5 bg-accent-700" : "size-1.5 bg-neutral-500"} />
            {status.label}
          </Tag>
          {salon.audience && <Tag>{salon.audience}</Tag>}
        </div>
        <h1 className="text-[clamp(32px,4vw,48px)]">{salon.name}</h1>
        <a href="#degerlendirmeler" className="flex items-center gap-2 self-start text-[15px]">
          <Icon name="star" filled className="text-accent" />
          <strong className="text-[18px]">{formatRating(salon.rating)}</strong>
          <span className="underline underline-offset-[3px]">{salon.reviewCount} değerlendirme</span>
        </a>
        <p className="max-w-[56ch] text-[16px] text-pretty text-neutral-800">{salon.description}</p>

        <div className="flex flex-col">
          <ContactRow icon="pin">
            <span>{salon.address}</span>
          </ContactRow>
          {salon.phone && (
            <ContactRow icon="phone">
              <a href={`tel:${salon.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                {salon.phone}
              </a>
            </ContactRow>
          )}
          {salon.email && (
            <ContactRow icon="mail">
              <a href={`mailto:${salon.email}`} className="break-all hover:text-accent">
                {salon.email}
              </a>
            </ContactRow>
          )}
          <ContactRow icon="clock">
            <a href="#calisma-saatleri" className="hover:text-accent">
              {today.closed ? "Bugün kapalı" : `Bugün ${today.start}–${today.end}`} · Tüm saatleri gör
            </a>
          </ContactRow>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <Button variant="primary" size="xl" align="between" href={`/kuaforler/${salon.id}/randevu`} className="flex-[2_1_220px]">
            Randevu Al
            <Icon name="arrowRight" />
          </Button>
          <Button size="xl" align="start" href="#hizmetler" className="flex-[1_1_140px] px-4 text-[14px]">
            Hizmetleri gör
          </Button>
        </div>
        <p className="flex items-center gap-2 text-[13px] text-neutral-700">
          <Icon name="check" size={14} />
          Boş saati seç, randevun anında oluşur — onay beklemek yok.
        </p>
      </div>
    </div>
  );
}
