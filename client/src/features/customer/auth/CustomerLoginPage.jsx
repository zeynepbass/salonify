"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import Spinner from "@/components/atoms/Spinner";
import ErrorNotice from "@/components/molecules/ErrorNotice";
import Field from "@/components/molecules/Field";
import Tabs from "@/components/molecules/Tabs";
import { demoAccounts } from "@/data/catalog";
import { useRoleGuardedAuth } from "@/features/shared/auth/hooks/useAuthMutations";
import { useRedirectWhenSignedIn } from "@/features/shared/auth/hooks/useAuthRedirect";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

const INITIAL_FORM = { name: "", phone: "", ...demoAccounts.customer };

export default function CustomerLoginPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(INITIAL_FORM);
  const auth = useRoleGuardedAuth("CUSTOMER", "Bu hesap bir kuaför hesabı. Kuaför paneli girişini kullanın.");
  const activeMutation = mode === "login" ? auth.login : auth.register;
  const submitting = activeMutation.isPending;

  useRedirectWhenSignedIn("CUSTOMER", { fallback: "/randevularim" });

  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const changeMode = (value) => {
    setMode(value);
    auth.reset();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (submitting) return;
    auth.reset();

    if (mode === "login") {
      auth.login.mutate({ email: form.email.trim(), password: form.password });
      return;
    }

    auth.register.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      ...(form.phone.trim() && { phone: form.phone.trim() }),
    });
  };

  return (
    <div className="page-container max-w-[520px] pt-10">
      <h1 className="mb-5 text-[clamp(30px,3.6vw,44px)]">{mode === "login" ? "Giriş yap" : "Hesap oluştur"}</h1>
      <Tabs
        label="Giriş türü"
        value={mode}
        onChange={changeMode}
        tabs={[
          { value: "login", label: "Giriş yap" },
          { value: "register", label: "Kayıt ol" },
        ]}
        className="mb-6"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "register" && (
          <>
            <Field label="Ad soyad" htmlFor="auth-name">
              <Input id="auth-name" value={form.name} onChange={setField("name")} autoComplete="name" required className="min-h-11" />
            </Field>
            <Field label="Telefon" hint="isteğe bağlı" htmlFor="auth-phone">
              <Input id="auth-phone" type="tel" value={form.phone} onChange={setField("phone")} autoComplete="tel" className="min-h-11" />
            </Field>
          </>
        )}
        <Field label="E-posta" htmlFor="auth-email">
          <Input id="auth-email" type="email" value={form.email} onChange={setField("email")} autoComplete="email" required className="min-h-11" />
        </Field>
        <Field label="Şifre" hint={mode === "register" ? `en az ${MIN_PASSWORD_LENGTH} karakter` : undefined} htmlFor="auth-password">
          <Input
            id="auth-password"
            type="password"
            value={form.password}
            onChange={setField("password")}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "register" ? MIN_PASSWORD_LENGTH : undefined}
            required
            className="min-h-11"
          />
        </Field>

        <ErrorNotice error={auth.roleError ?? activeMutation.error} />

        <Button type="submit" variant="primary" size="lg" align="between" disabled={submitting}>
          {mode === "login" ? "Giriş yap" : "Kayıt ol"}
          {submitting ? <Spinner /> : <Icon name="arrowRight" />}
        </Button>
      </form>
    </div>
  );
}
