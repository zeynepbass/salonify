import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import Tag from "@/components/atoms/Tag";
import { TODAY, CURRENT_TIME } from "@/data/mock/clock";
import { closedDays, workingHours } from "@/data/mock/workingHours";
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

export default function SalonProfileHeader({ salon }) {
  const status = getOpeningStatus(workingHours, closedDays, TODAY, CURRENT_TIME);
  const today = getDaySchedule(workingHours, closedDays, TODAY);

  return (
    <div className="mt-4 flex flex-wrap gap-10">
      <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-2">
        <ImagePlaceholder label="salon profil görseli" className="aspect-[4/3]" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((index) => (
            <ImagePlaceholder key={index} stripe={10} className="aspect-square" />
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Tag variant={status.open ? "accent" : "outline"} className="gap-1.5">
            <span className={status.open ? "size-1.5 bg-accent-700" : "size-1.5 bg-neutral-500"} />
            {status.label}
          </Tag>
          <Tag>{salon.audience}</Tag>
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
          <ContactRow icon="phone">
            <a href={`tel:${salon.phone.replace(/\s/g, "")}`} className="hover:text-accent">
              {salon.phone}
            </a>
          </ContactRow>
          <ContactRow icon="mail">
            <a href={`mailto:${salon.email}`} className="break-all hover:text-accent">
              {salon.email}
            </a>
          </ContactRow>
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
