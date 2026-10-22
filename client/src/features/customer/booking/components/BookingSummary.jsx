import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import Spinner from "@/components/atoms/Spinner";
import { cn } from "@/lib/cn";

const EMPTY = "—";

const ASSURANCES = [
  "Randevun anında oluşturulur, kuaföre bildirim gider.",
  "Randevu saatine kadar Randevularım sayfasından iptal edebilirsin.",
];

export default function BookingSummary({ salon, rows, total, canSubmit, submitting, onSubmit }) {
  const label = submitting ? "Oluşturuluyor…" : canSubmit ? "Randevuyu Oluştur" : "Hizmet, tarih ve saat seç";

  return (
    <aside
      aria-label="Randevu özeti"
      className="flex max-w-full flex-[1_1_320px] flex-col gap-4 bg-surface p-6 lg:sticky lg:top-[92px]"
    >
      <h2 className="eyebrow tracking-[0.08em] text-neutral-700">Randevu özeti</h2>
      <div>
        <div className="text-[20px] font-extrabold">{salon.name}</div>
        <div className="mt-1 flex items-start gap-1.5 text-[13px] text-neutral-700">
          <Icon name="pin" size={14} className="mt-0.5" />
          {salon.address}
        </div>
      </div>
      <dl className="flex flex-col border-t-2 border-line">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3 border-b border-line py-2.5 text-[14px]">
            <dt className="text-neutral-700">{row.label}</dt>
            <dd className={cn("text-right font-bold", !row.value && "text-neutral-600")}>{row.value ?? EMPTY}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between pt-3.5">
          <dt className="text-[14px]">Toplam</dt>
          <dd className="text-[26px] font-extrabold">{total ?? EMPTY}</dd>
        </div>
      </dl>
      <Button
        variant="primary"
        align="between"
        disabled={!canSubmit || submitting}
        aria-busy={submitting}
        onClick={onSubmit}
        className="h-[54px] px-[18px] text-[16px]"
      >
        {label}
        {submitting ? <Spinner /> : <Icon name="arrowRight" />}
      </Button>
      <ul className="flex flex-col gap-1.5 text-[12px] leading-normal text-neutral-700">
        {ASSURANCES.map((text) => (
          <li key={text} className="flex gap-1.5">
            <Icon name="check" size={14} className="mt-0.5" />
            {text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
