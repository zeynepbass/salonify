"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import Spinner from "@/components/atoms/Spinner";
import Field from "@/components/molecules/Field";
import Tabs from "@/components/molecules/Tabs";
import { demoAccounts } from "@/data/catalog";
import { useAuth } from "@/features/customer/auth/AuthProvider";
import { getErrorMessage } from "@/lib/api";

const INITIAL_FORM = { name: "", phone: "", ...demoAccounts.customer };

function getSafeNext(value) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/randevularim";
}

export default function CustomerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, user, login, register, logout } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const next = getSafeNext(searchParams.get("next"));

  useEffect(() => {
    if (status === "authenticated" && user.role === "CUSTOMER") router.replace(next);
  }, [status, user, next, router]);

  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const signedIn =
        mode === "login"
          ? await login({ email: form.email, password: form.password })
          : await register({
              name: form.name.trim(),
              email: form.email,
              password: form.password,
              ...(form.phone.trim() && { phone: form.phone.trim() }),
            });

      if (signedIn.role !== "CUSTOMER") {
        await logout();
        setError("Bu hesap bir kuaför hesabı. Kuaför paneli girişini kullanın.");
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-[520px] pt-10">
      <h1 className="mb-5 text-[clamp(30px,3.6vw,44px)]">{mode === "login" ? "Giriş yap" : "Hesap oluştur"}</h1>
      <Tabs
        label="Giriş türü"
        value={mode}
        onChange={(value) => {
          setMode(value);
          setError(null);
        }}
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
        <Field label="Şifre" hint={mode === "register" ? "en az 8 karakter" : undefined} htmlFor="auth-password">
          <Input
            id="auth-password"
            type="password"
            value={form.password}
            onChange={setField("password")}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "register" ? 8 : undefined}
            required
            className="min-h-11"
          />
        </Field>

        {error && (
          <p role="alert" className="flex gap-2 bg-accent-100 p-3 text-[13px] text-accent-800">
            <Icon name="alert" size={16} />
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" align="between" disabled={submitting}>
          {mode === "login" ? "Giriş yap" : "Kayıt ol"}
          {submitting ? <Spinner /> : <Icon name="arrowRight" />}
        </Button>
      </form>
    </div>
  );
}
