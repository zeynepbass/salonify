"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import Logo from "@/components/atoms/Logo";
import Spinner from "@/components/atoms/Spinner";
import ErrorNotice from "@/components/molecules/ErrorNotice";
import Field from "@/components/molecules/Field";
import { demoAccounts } from "@/data/catalog";
import { useRoleGuardedAuth } from "@/features/shared/auth/hooks/useAuthMutations";
import { useRedirectWhenSignedIn } from "@/features/shared/auth/hooks/useAuthRedirect";

export default function LoginScreen() {
  const [form, setForm] = useState(demoAccounts.salon);
  const auth = useRoleGuardedAuth("SALON", "Bu hesap bir kuaför hesabı değil. Müşteri girişini kullanın.");
  const submitting = auth.login.isPending;

  useRedirectWhenSignedIn("SALON", { prefix: "/panel", fallback: "/panel" });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (submitting) return;
    auth.reset();
    auth.login.mutate({ email: form.email.trim(), password: form.password });
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
          <ErrorNotice error={auth.roleError ?? auth.login.error} />
          <Button type="submit" variant="primary" size="lg" align="between" disabled={submitting}>
            Giriş yap
            {submitting ? <Spinner /> : <Icon name="arrowRight" />}
          </Button>
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
