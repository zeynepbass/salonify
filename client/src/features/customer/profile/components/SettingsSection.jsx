"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import ErrorNotice from "@/components/molecules/ErrorNotice";
import Field from "@/components/molecules/Field";
import { useToast } from "@/components/organisms/ToastProvider";
import { useLogout } from "@/features/customer/auth/hooks/useAuth";
import { useChangePassword, useDeleteAccount } from "@/features/customer/profile/hooks/useProfile";
import { getResponseMessage } from "@/lib/api";

const MIN_PASSWORD_LENGTH = 8;

function PasswordForm({ onDone }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const change = useChangePassword({
    onSuccess: () => {
      showToast("Şifren değiştirildi.");
      onDone();
    },
  });

  const samePassword = form.newPassword !== "" && form.newPassword === form.currentPassword;
  const invalid = !form.currentPassword || form.newPassword.length < MIN_PASSWORD_LENGTH || samePassword;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (invalid || change.isPending) return;
    change.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 bg-surface p-4">
      <Field label="Mevcut şifre" htmlFor="settings-current-password">
        <Input
          id="settings-current-password"
          type="password"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
          required
        />
      </Field>
      <Field
        label="Yeni şifre"
        hint={`en az ${MIN_PASSWORD_LENGTH} karakter`}
        htmlFor="settings-new-password"
        error={samePassword && "Yeni şifre mevcut şifreyle aynı olamaz."}
      >
        <Input
          id="settings-new-password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={form.newPassword}
          onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
          required
        />
      </Field>
      <ErrorNotice error={change.error} />
      <div className="flex gap-2">
        <Button onClick={onDone}>Vazgeç</Button>
        <Button type="submit" variant="primary" disabled={invalid || change.isPending}>
          {change.isPending ? "Kaydediliyor…" : "Şifreyi kaydet"}
        </Button>
      </div>
    </form>
  );
}

function DeleteAccountForm({ onDone }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const removal = useDeleteAccount({
    onSuccess: (response) => {
      showToast(getResponseMessage(response, "Hesabın silindi."));
      router.replace("/");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!password || removal.isPending) return;
    removal.mutate(password);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3 bg-accent-100 p-4">
      <Field label="Onaylamak için şifreni gir" htmlFor="settings-delete-password">
        <Input
          id="settings-delete-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </Field>
      <ErrorNotice error={removal.error} className="bg-canvas" />
      <div className="flex gap-2">
        <Button onClick={onDone}>Vazgeç</Button>
        <Button type="submit" variant="danger" disabled={!password || removal.isPending}>
          {removal.isPending ? "Siliniyor…" : "Hesabımı kalıcı olarak sil"}
        </Button>
      </div>
    </form>
  );
}

export default function SettingsSection() {
  const router = useRouter();
  const [openForm, setOpenForm] = useState(null);
  const logout = useLogout({ onSettled: () => router.replace("/") });

  return (
    <section>
      <h2 className="mb-4 text-[20px]">Ayarlar</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4">
        <Field label="Şifre">
          <Button align="start" className="min-h-10 w-full" onClick={() => setOpenForm("password")}>
            Şifreyi değiştir
          </Button>
        </Field>
      </div>
      {openForm === "password" && <PasswordForm onDone={() => setOpenForm(null)} />}

      <div className="mt-8 border-t-2 border-line pt-5">
        <Button disabled={logout.isPending} onClick={() => logout.mutate()}>
          {logout.isPending ? "Çıkış yapılıyor…" : "Çıkış yap"}
        </Button>
      </div>

      <div className="mt-8 border-t-2 border-line pt-5">
        <div className="font-bold">Hesabı sil</div>
        <p className="mt-1 mb-3 text-[13px] text-neutral-700">
          Tüm randevu geçmişin ve değerlendirmelerin kalıcı olarak silinir.
        </p>
        {openForm === "delete" ? (
          <DeleteAccountForm onDone={() => setOpenForm(null)} />
        ) : (
          <Button variant="danger" onClick={() => setOpenForm("delete")}>
            Hesabımı sil
          </Button>
        )}
      </div>
    </section>
  );
}
