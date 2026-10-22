import Link from "next/link";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import Logo from "@/components/atoms/Logo";
import { cn } from "@/lib/cn";

export default function Navbar({ items, unreadCount, userName }) {
  return (
    <header className="glass sticky top-0 z-30 border-b border-line">
      <div className="page-container flex h-[68px] items-center gap-8">
        <Link href="/" aria-label="SalonaBOX ana sayfa">
          <Logo />
        </Link>
        <nav aria-label="Ana menü" className="hidden gap-1 self-stretch md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex items-center border-b-[3px] px-3 text-[14px] font-semibold transition-colors hover:text-accent",
                item.active ? "border-accent text-accent" : "border-transparent text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/panel"
            className="hidden rounded-md border border-line px-3 py-2 text-[13px] font-semibold transition-colors hover:border-neutral-500 hover:bg-neutral-100 md:block"
          >
            Kuaför Paneli
          </Link>
          {userName ? (
            <>
              <Button
                variant="plain"
                size="icon"
                href="/bildirimler"
                aria-label={`Bildirimler, ${unreadCount} okunmamış`}
                className="relative"
              >
                <Icon name="bell" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-extrabold text-canvas">
                    {unreadCount}
                  </span>
                )}
              </Button>
              <Link href="/profil" aria-label={`Profil: ${userName}`}>
                <Avatar name={userName} size="sm" tone="dark" />
              </Link>
            </>
          ) : (
            <Button variant="primary" href="/giris">
              Giriş yap
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
