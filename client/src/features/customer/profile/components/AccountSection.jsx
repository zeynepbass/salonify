"use client";

import { useState } from "react";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import ErrorNotice from "@/components/molecules/ErrorNotice";
import Field from "@/components/molecules/Field";
import { useToast } from "@/components/organisms/ToastProvider";
import { useLocation } from "@/features/customer/location/LocationProvider";
import { useUpdateProfile } from "@/features/customer/profile/hooks/useProfile";
import { formatMonthYear } from "@/lib/date";

export default function AccountSection({ user }) {
  const { location, locationLabel, openLocationDialog } = useLocation();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone ?? "" });
  const update = useUpdateProfile({ onSuccess: () => showToast("Hesap bilgilerin güncellendi.") });
  const saving = update.isPending;

  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const invalid = !form.name.trim() || !form.email.trim();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (invalid || saving) return;

    update.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      location: { city: location.city, district: location.district },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-7 flex flex-wrap items-center gap-5">
        <Avatar name={form.name || user.name} size="lg" tone="dark" />
        <div>
          <div className="text-[22px] font-extrabold">{form.name || user.name}</div>
          <div className="text-[13px] text-neutral-700">
            Üyelik: {formatMonthYear(user.createdAt)} · {location.city}, {location.district}
          </div>
        </div>
      </div>

      <h2 className="mb-4 border-t border-line pt-5 text-[20px]">Hesap bilgilerim</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4">
        <Field label="Ad soyad" htmlFor="profile-name" error={!form.name.trim() && "Ad soyad gerekli."}>
          <Input id="profile-name" value={form.name} onChange={setField("name")} aria-invalid={!form.name.trim()} autoComplete="name" />
        </Field>
        <Field label="E-posta" htmlFor="profile-email" error={!form.email.trim() && "E-posta gerekli."}>
          <Input
            id="profile-email"
            type="email"
            value={form.email}
            onChange={setField("email")}
            aria-invalid={!form.email.trim()}
            autoComplete="email"
          />
        </Field>
        <Field label="Telefon" htmlFor="profile-phone">
          <Input id="profile-phone" type="tel" value={form.phone} onChange={setField("phone")} autoComplete="tel" />
        </Field>
        <Field label="Konum">
          <button
            type="button"
            onClick={openLocationDialog}
            className="flex min-h-10 w-full items-center gap-2 border border-line bg-canvas px-3 py-2 text-left text-[14px] transition-colors hover:border-ink"
          >
            <Icon name="pin" size={14} />
            {locationLabel}
          </button>
        </Field>
      </div>
      <ErrorNotice error={update.error} className="mt-4" />
      <Button type="submit" variant="primary" size="md" disabled={invalid || saving} className="mt-5 px-[18px]">
        {saving ? "Kaydediliyor…" : "Kaydet"}
      </Button>
    </form>
  );
}
