"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import Logo from "@/components/atoms/Logo";
import Field from "@/components/molecules/Field";
import { salonOwner } from "@/data/mock/users";

export default function LoginScreen() {
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    router.push("/panel");
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
            <Input id="login-email" type="email" defaultValue={salonOwner.email} autoComplete="email" required className="min-h-11" />
          </Field>
          <Field label="Şifre" htmlFor="login-password">
            <Input id="login-password" type="password" autoComplete="current-password" placeholder="••••••••" className="min-h-11" />
          </Field>
          <Button type="submit" variant="primary" size="lg" align="between">
            Giriş yap
            <Icon name="arrowRight" />
          </Button>
          <span className="text-[13px] text-neutral-700">Bu bir tanıtım panelidir; şifre gerekmez.</span>
        </form>
      </div>
      <div className="flex min-h-[320px] flex-[1_1_440px] flex-col justify-end bg-accent px-[clamp(24px,6vw,96px)] py-12 text-canvas">
        <p className="max-w-[12ch] text-[clamp(32px,4.4vw,60px)] leading-[1.02] font-extrabold tracking-[-0.03em]">
          Randevular onay beklemeden takvimine düşer.
        </p>
        <p className="mt-4 max-w-[44ch] text-[16px]">
          Müşterin boş saati seçer, randevu oluşur, sana bildirim gelir. Sen sadece işine odaklan.
        </p>
      </div>
    </div>
  );
}
