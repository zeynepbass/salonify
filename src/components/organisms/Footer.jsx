import Link from "next/link";
import Logo from "@/components/atoms/Logo";

const COLUMNS = [
  {
    title: "Keşfet",
    links: [
      { label: "Kuaförler", href: "/kuaforler" },
      { label: "Hizmetler", href: "/#kategoriler" },
      { label: "En popüler", href: "/kuaforler?sirala=populer" },
    ],
  },
  {
    title: "Kuaförler için",
    links: [
      { label: "Kuaför paneli", href: "/panel" },
      { label: "Panele giriş", href: "/panel/giris" },
    ],
  },
  {
    title: "Hesabım",
    links: [
      { label: "Randevularım", href: "/randevularim" },
      { label: "Bildirimler", href: "/bildirimler" },
      { label: "Profil", href: "/profil" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-line">
      <div className="page-container grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-8 pt-10 pb-6">
        <div className="flex flex-col gap-2.5">
          <Logo size="sm" />
          <p className="max-w-[30ch] text-[13px] text-neutral-700">
            Kuaförünü bul, boş saati seç, randevun anında oluşsun.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-2 text-[14px]">
            <h2 className="eyebrow mb-1 text-neutral-700">{column.title}</h2>
            {column.links.map((link) => (
              <Link key={link.label} href={link.href} className="transition-colors hover:text-accent">
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="page-container">
        <div className="flex flex-wrap justify-center gap-2 border-t border-line pt-4 pb-6 text-[12px] text-neutral-700">
          <span>© 2026 SalonaBOX</span>
 
        </div>
      </div>
    </footer>
  );
}
