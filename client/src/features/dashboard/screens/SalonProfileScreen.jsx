"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import { Input, Textarea } from "@/components/atoms/Input";
import Tag from "@/components/atoms/Tag";
import Field from "@/components/molecules/Field";
import { useToast } from "@/components/organisms/ToastProvider";
import { salonOwner } from "@/data/mock/users";
import { usePanel } from "@/features/dashboard/PanelProvider";
import { getSalon } from "@/lib/catalog";
import { WEEKDAYS } from "@/lib/date";

const salon = getSalon(salonOwner.salonId);

function SummaryCard({ title, actionLabel, href, children }) {
  return (
    <div className="bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="eyebrow text-neutral-700">{title}</h2>
        <Button variant="ghost" href={href}>
          {actionLabel}
        </Button>
      </div>
      {children}
    </div>
  );
}

export default function SalonProfileScreen() {
  const { services, hours } = usePanel();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: salon.name,
    email: salon.email,
    phone: salon.phone,
    address: salon.address,
    description: salon.description,
  });

  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    showToast("Profil kaydedildi.");
  };

  return (
    <div className="flex flex-wrap items-start gap-10">
      <form onSubmit={handleSubmit} className="flex min-w-0 flex-[2_1_560px] flex-col gap-5">
        <div className="flex flex-wrap items-center gap-5">
          <ImagePlaceholder stripe={10} className="size-[120px]" />
          <div className="flex flex-col gap-1.5">
            <strong className="text-[20px]">Profil görseli</strong>
            <span className="text-[13px] text-neutral-700">En az 1200×900 px, JPG veya PNG. Siyah-beyaz yayınlanır.</span>
            <Button className="self-start">
              <Icon name="camera" />
              Görsel yükle
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4 border-t-2 border-line pt-5">
          <Field label="Salon / kuaför adı" htmlFor="salon-name">
            <Input id="salon-name" value={form.name} onChange={setField("name")} required />
          </Field>
          <Field label="E-posta" htmlFor="salon-email">
            <Input id="salon-email" type="email" value={form.email} onChange={setField("email")} required />
          </Field>
          <Field label="Telefon" htmlFor="salon-phone">
            <Input id="salon-phone" type="tel" value={form.phone} onChange={setField("phone")} />
          </Field>
          <Field label="Konum" htmlFor="salon-address">
            <Input id="salon-address" value={form.address} onChange={setField("address")} />
          </Field>
        </div>
        <Field label="Hakkında" htmlFor="salon-description">
          <Textarea id="salon-description" value={form.description} onChange={setField("description")} className="min-h-[120px]" />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" size="md" className="px-[18px]">
            Kaydet
          </Button>
          <Button size="md" href={`/kuaforler/${salon.id}`} className="px-[18px]">
            <Icon name="external" />
            Herkese açık profili gör
          </Button>
        </div>
      </form>

      <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
        <SummaryCard title="Hizmetler" actionLabel="Yönet" href="/panel/hizmetler">
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {services
              .filter((service) => service.active)
              .map((service) => (
                <Tag key={service.id}>{service.name}</Tag>
              ))}
          </div>
        </SummaryCard>
        <SummaryCard title="Çalışma saatleri" actionLabel="Düzenle" href="/panel/calisma-saatleri">
          {hours.map((day) => (
            <div key={day.weekday} className="flex justify-between border-b border-line py-1.5 text-[13px]">
              <span>{WEEKDAYS[day.weekday]}</span>
              <span className="font-bold">{day.open ? `${day.start}–${day.end}` : "Kapalı"}</span>
            </div>
          ))}
        </SummaryCard>
      </aside>
    </div>
  );
}
