"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import Logo from "@/components/atoms/Logo";
import Spinner from "@/components/atoms/Spinner";
import Field from "@/components/molecules/Field";
import { demoAccounts } from "@/data/catalog";
import { useAuth } from "@/features/customer/auth/AuthProvider";
import { getErrorMessage } from "@/lib/api";

function getSafeNext(value) {
  return value?.startsWith("/panel") ? value : "/panel";
}

export default function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, user, login, logout } = useAuth();
  const [form, setForm] = useState(demoAccounts.salon);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const next = getSafeNext(searchParams.get("next"));

  useEffect(() => {
    if (status === "authenticated" && user.role === "SALON") router.replace(next);
  }, [status, user, next, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const signedIn = await login(form);
      if (signedIn.role !== "SALON") {
        await logout();
        setError("Bu hesap bir kuaför hesabı değil. Müşteri girişini kullanın.");
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-wrap">
      <div className="flex flex-[1_1_440px] flex-col justify-center gap-6 px-[clamp(24px,6vw,96px)] py-12">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/" aria-label="SalonaBOX ana sayfa">
            <Logo />
          </Link>
          <span className="border border-line px-2 py-0.5 text-[12px]">Kuaför Paneli</span>
        </div>
        <h1 className="text-[clamp(32px,4vw,44px)]">Panele giriş yap</h1>
        <form onSubmit={handleSubmit} className="flex max-w-[420px] flex-col gap-4">
          <Field label="E-posta" htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              autoComplete="email"
              required
              className="min-h-11"
            />
          </Field>
          <Field label="Şifre" htmlFor="login-password">
            <Input
              id="login-password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              autoComplete="current-password"
              placeholder="••••••••"
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
            Giriş yap
            {submitting ? <Spinner /> : <Icon name="arrowRight" />}
          </Button>
          <span className="text-[13px] text-neutral-700">Adminden email şifre talep et.</span>
        </form>
      </div>

      <div
        className="relative flex flex-[1_1_440px] flex-col justify-end bg-ink bg-cover bg-center bg-no-repeat px-[clamp(24px,6vw,96px)] py-12 text-canvas"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgb(120 0 0 / 0.85), rgb(220 20 60 / 0.20)), url('/assets/images/login-back.jpg')",
        }}
      >
        <p className="max-w-[12ch] text-[clamp(32px,4.4vw,60px)] leading-[1.02] font-extrabold">
          Randevular onay beklemeden takvimine düşer.
        </p>
        <p className="mt-4 max-w-[44ch] text-[16px]">
          Müşterin boş saati seçer, randevu oluşur, sana bildirim gelir. Sen sadece işine odaklan.
        </p>
      </div>
    </div>
  );
}
