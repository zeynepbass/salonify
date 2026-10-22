"use client";

import { useRef, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import { Input, Textarea } from "@/components/atoms/Input";
import Tag from "@/components/atoms/Tag";
import ErrorNotice from "@/components/molecules/ErrorNotice";
import Field from "@/components/molecules/Field";
import QueryState from "@/components/organisms/QueryState";
import { useToast } from "@/components/organisms/ToastProvider";
import { useMySalon, useUpdateSalon, useUploadCover } from "@/features/panel/hooks/useSalonProfile";
import { usePanelSchedule } from "@/features/panel/hooks/useSchedule";
import { useServices } from "@/features/panel/hooks/useServices";
import { getErrorMessage } from "@/lib/api";
import { WEEKDAYS } from "@/lib/date";

function SummaryCard({ title, actionLabel, href, children }) {
  return (
    <div className="rounded-xl bg-surface p-5">
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

const MAX_COVER_BYTES = 5 * 1024 * 1024;
const COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function SalonProfileScreen() {
  const salonQuery = useMySalon();

  return (
    <QueryState query={salonQuery} errorTitle="Salon profili yüklenemedi.">
      {(salon) => <SalonProfile salon={salon} />}
    </QueryState>
  );
}

function SalonProfile({ salon }) {
  const { showToast } = useToast();
  const { data: services = [] } = useServices();
  const { hours } = usePanelSchedule();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: salon.name ?? "",
    email: salon.email ?? "",
    phone: salon.phone ?? "",
    address: salon.address ?? "",
    description: salon.description ?? "",
  });

  const update = useUpdateSalon({ onSuccess: () => showToast("Profil kaydedildi.") });
  const cover = useUploadCover({
    onSuccess: () => showToast("Profil görseli güncellendi."),
    onError: (error) => showToast(getErrorMessage(error), { tone: "error" }),
  });
  const saving = update.isPending;
  const uploading = cover.isPending;

  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || saving) return;

    update.mutate({
      name: form.name.trim(),
      ...(form.email.trim() && { email: form.email.trim() }),
      phone: form.phone.trim(),
      address: form.address.trim(),
      description: form.description.trim(),
    });
  };

  const handleCoverChange = (event) => {
    const [file] = event.target.files;
    event.target.value = "";
    if (!file) return;

    if (!COVER_TYPES.includes(file.type)) {
      showToast("Yalnızca JPG, PNG veya WebP görsel yükleyebilirsin.", { tone: "error" });
      return;
    }
    if (file.size > MAX_COVER_BYTES) {
      showToast("Görsel en fazla 5 MB olabilir.", { tone: "error" });
      return;
    }

    cover.mutate(file);
  };

  return (
    <div className="flex flex-wrap items-start gap-10">
      <form onSubmit={handleSubmit} className="flex min-w-0 flex-[2_1_560px] flex-col gap-5">
        <div className="flex flex-wrap items-center gap-5">
          <ImagePlaceholder src={salon.coverImage} alt={salon.name} stripe={10} className="size-[120px]" />
          <div className="flex flex-col gap-1.5">
            <strong className="text-[20px]">Profil görseli</strong>
            <span className="text-[13px] text-neutral-700">JPG, PNG veya WebP · en fazla 5 MB.</span>
            <Button className="self-start" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              <Icon name="camera" />
              {uploading ? "Yükleniyor…" : "Görsel yükle"}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleCoverChange} />
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4 border-t border-line pt-5">
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
        <ErrorNotice error={update.error} />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" size="md" disabled={saving || !form.name.trim()} className="px-[18px]">
            {saving ? "Kaydediliyor…" : "Kaydet"}
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
            {services.map((service) => (
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
