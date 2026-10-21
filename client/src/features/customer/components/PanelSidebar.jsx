import Link from "next/link";
import Icon from "@/components/atoms/Icon";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import Logo from "@/components/atoms/Logo";
import LogoutButton from "@/features/customer/components/LogoutButton";
import { PANEL_NAV } from "@/features/customer/panelNav";
import { cn } from "@/lib/cn";

const FOOTER_LINK = "flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors hover:bg-neutral-200 max-rail:justify-center";

export default function PanelSidebar({ salon, pathname, unreadCount }) {
  return (
    <aside
      aria-label="Panel menüsü"
      className="sticky top-0 z-25 hidden h-screen w-[72px] flex-none flex-col border-r-2 border-line bg-canvas md:flex rail:w-[248px]"
    >
      <Link href="/panel" aria-label="SalonaBOX kuaför paneli" className="flex h-[72px] flex-none items-center border-b-2 border-line px-5 max-rail:justify-center">
        <Logo size="md" showText={false} className="rail:hidden" />
        <Logo size="md" className="hidden text-[18px] rail:inline-flex" />
      </Link>
      <div className="hidden items-center gap-2.5 border-b border-line px-5 py-4 rail:flex">
        <ImagePlaceholder src={salon.coverImage} alt={salon.name} stripe={6} className="size-9 flex-none" />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-extrabold">{salon.name}</div>
          <div className="text-[12px] text-neutral-700">
            {[salon.neighborhood, salon.district].filter(Boolean).join(", ")}
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-x-hidden overflow-y-auto px-2 py-3 rail:px-3">
        {PANEL_NAV.map((item) => {
          const active = item.href === pathname;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 px-3 py-2.5 text-[14px] font-semibold transition-colors max-rail:justify-center",
                active ? "bg-ink text-canvas" : "hover:bg-neutral-200",
              )}
            >
              <Icon name={item.icon} />
              <span className="hidden flex-1 rail:block">{item.label}</span>
              {item.href === "/panel/bildirimler" && unreadCount > 0 && (
                <span className="hidden h-[18px] min-w-[18px] place-items-center bg-accent px-[5px] text-[11px] font-extrabold text-canvas rail:grid">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-0.5 border-t border-line p-3">
        <Link href={`/kuaforler/${salon.id}`} title="Müşteri sitesi" className={FOOTER_LINK}>
          <Icon name="external" />
          <span className="hidden rail:inline">Müşteri sitesini aç</span>
        </Link>
        <LogoutButton className={`${FOOTER_LINK} text-left`}>
          <Icon name="logout" />
          <span className="hidden rail:inline">Çıkış yap</span>
        </LogoutButton>
      </div>
    </aside>
  );
}
