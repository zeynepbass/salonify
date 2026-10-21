"use client";

import Link from "next/link";
import Icon from "@/components/atoms/Icon";
import LogoutButton from "@/features/dashboard/components/LogoutButton";
import { PANEL_NAV } from "@/features/dashboard/panelNav";
import { cn } from "@/lib/cn";
import { useBodyScrollLock, useEscapeKey } from "@/lib/hooks";

const ITEM = "flex items-center gap-3 border-b border-line px-2 py-3.5 text-[15px] font-semibold";

export default function PanelMenuSheet({ pathname, salonId, onClose }) {
  useEscapeKey(onClose);
  useBodyScrollLock();

  return (
    <div className="md:hidden">
      <div className="fixed inset-0 z-60 bg-neutral-900/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
        className="fixed inset-x-0 bottom-0 z-61 flex max-h-[86vh] animate-rise flex-col overflow-y-auto border-t-2 border-ink bg-canvas p-4"
      >
        {PANEL_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            aria-current={item.href === pathname ? "page" : undefined}
            className={cn(ITEM, item.href === pathname && "text-accent")}
          >
            <Icon name={item.icon} />
            {item.label}
          </Link>
        ))}
        <Link href={`/kuaforler/${salonId}`} onClick={onClose} className={ITEM}>
          <Icon name="external" />
          Müşteri sitesini aç
        </Link>
        <LogoutButton onDone={onClose} className={cn(ITEM, "border-b-0 text-left")}>
          <Icon name="logout" />
          Çıkış yap
        </LogoutButton>
      </div>
    </div>
  );
}
