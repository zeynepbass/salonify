"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/molecules/BottomNav";
import Footer from "@/components/organisms/Footer";
import Navbar from "@/components/organisms/Navbar";
import { ToastProvider } from "@/components/organisms/ToastProvider";
import { currentUser } from "@/data/mock/users";
import { AppointmentsProvider } from "@/features/appointments/AppointmentsProvider";
import { LocationProvider } from "@/features/location/LocationProvider";
import { NotificationsProvider, useNotifications } from "@/features/notifications/NotificationsProvider";

const NAV_ITEMS = [
  { label: "Keşfet", shortLabel: "Keşfet", href: "/", icon: "home", match: (path) => path === "/" },
  { label: "Kuaförler", shortLabel: "Ara", href: "/kuaforler", icon: "search", match: (path) => path.startsWith("/kuaforler") },
  {
    label: "Randevularım",
    shortLabel: "Randevular",
    href: "/randevularim",
    icon: "calendar",
    match: (path) => path.startsWith("/randevularim"),
  },
];

const PROFILE_ITEM = { label: "Profil", href: "/profil", icon: "user", match: (path) => path.startsWith("/profil") };

const ACTION_BAR_ROUTE = /^\/kuaforler\/[^/]+(\/randevu)?$/;

function Chrome({ children }) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  const navItems = NAV_ITEMS.map((item) => ({ ...item, active: item.match(pathname) }));
  const bottomItems = [...NAV_ITEMS, PROFILE_ITEM].map((item) => ({
    label: item.shortLabel ?? item.label,
    href: item.href,
    icon: item.icon,
    active: item.match(pathname),
  }));

  return (
    <div className="flex min-h-screen flex-col pb-[76px] md:pb-0">
      <Navbar items={navItems} unreadCount={unreadCount} userName={currentUser.name} />
      <main className="flex-1">{children}</main>
      <Footer />
      {!ACTION_BAR_ROUTE.test(pathname) && <BottomNav label="Mobil menü" items={bottomItems} className="md:hidden" />}
    </div>
  );
}

export default function CustomerLayout({ children }) {
  return (
    <ToastProvider className="bottom-[88px] left-4 md:bottom-6 md:left-6">
      <NotificationsProvider>
        <AppointmentsProvider>
          <LocationProvider>
            <Chrome>{children}</Chrome>
          </LocationProvider>
        </AppointmentsProvider>
      </NotificationsProvider>
    </ToastProvider>
  );
}
