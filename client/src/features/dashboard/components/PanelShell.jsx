"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import BottomNav from "@/components/molecules/BottomNav";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
import { ToastProvider } from "@/components/organisms/ToastProvider";
import { TODAY } from "@/data/mock/clock";
import { salonOwner } from "@/data/mock/users";
import { PanelProvider, usePanel } from "@/features/dashboard/PanelProvider";
import AppointmentDrawer from "@/features/dashboard/components/AppointmentDrawer";
import AppointmentFormDialog from "@/features/dashboard/components/AppointmentFormDialog";
import PanelHeader from "@/features/dashboard/components/PanelHeader";
import PanelMenuSheet from "@/features/dashboard/components/PanelMenuSheet";
import PanelSidebar from "@/features/dashboard/components/PanelSidebar";
import { PANEL_MOBILE_NAV, PANEL_NAV, getActivePanelItem } from "@/features/dashboard/panelNav";
import { toAppointmentView } from "@/features/dashboard/scheduling";
import { getSalon } from "@/lib/catalog";
import { formatLongDate, getDateParts } from "@/lib/date";

const salon = getSalon(salonOwner.salonId);

function getSubtitle(href, { services, unreadCount }) {
  const subtitles = {
    "/panel": `${getDateParts(TODAY).weekday}, ${formatLongDate(TODAY)}`,
    "/panel/takvim": "Randevular, boş ve bloklu saatler",
    "/panel/randevular": "Tüm randevular",
    "/panel/hizmetler": `${services.filter((service) => service.active).length} aktif hizmet`,
    "/panel/portfoy": "Herkese açık profilde gösterilen işler",
    "/panel/bildirimler": `${unreadCount} okunmamış`,
    "/panel/profil": "Müşterilerin gördüğü bilgiler",
    "/panel/calisma-saatleri": "Boş slotlar bu saatlerden üretilir",
  };
  return subtitles[href];
}

function Shell({ children }) {
  const pathname = usePathname();
  const panel = usePanel();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeItem = getActivePanelItem(pathname);
  const selected = panel.appointments.find((item) => item.id === panel.selectedAppointmentId);

  const bottomItems = [
    ...PANEL_NAV.filter((item) => PANEL_MOBILE_NAV.includes(item.href)).map((item) => ({
      label: item.shortLabel ?? item.label,
      href: item.href,
      icon: item.icon,
      active: !menuOpen && item.href === pathname,
    })),
    { label: "Menü", icon: "menu", active: menuOpen, onClick: () => setMenuOpen(true) },
  ];

  return (
    <div className="flex min-h-screen">
      <PanelSidebar salon={salon} pathname={pathname} unreadCount={panel.unreadCount} />
      <div className="flex min-w-0 flex-1 flex-col pb-[72px] md:pb-0">
        <PanelHeader
          title={activeItem.title ?? activeItem.label}
          subtitle={getSubtitle(activeItem.href, panel)}
          unreadCount={panel.unreadCount}
          onNewAppointment={() => panel.openAppointmentForm()}
        />
        <main className="w-full max-w-[1440px] flex-1 px-[clamp(16px,3vw,32px)] pt-7 pb-12">{children}</main>
      </div>

      <BottomNav label="Mobil menü" items={bottomItems} className="md:hidden" />
      {menuOpen && <PanelMenuSheet pathname={pathname} salonId={salon.id} onClose={() => setMenuOpen(false)} />}

      {selected && (
        <AppointmentDrawer appointment={toAppointmentView(selected, panel.services)} onClose={panel.closeAppointment} />
      )}
      {panel.appointmentForm && (
        <AppointmentFormDialog draft={panel.appointmentForm} onClose={panel.closeAppointmentForm} />
      )}
      {panel.confirmation && (
        <ConfirmDialog
          title={panel.confirmation.title}
          confirmLabel={panel.confirmation.confirmLabel}
          onConfirm={panel.confirmation.onConfirm}
          onClose={panel.closeConfirmation}
        >
          {panel.confirmation.body}
        </ConfirmDialog>
      )}
    </div>
  );
}

export default function PanelShell({ children }) {
  return (
    <ToastProvider className="bottom-[84px] left-4 md:bottom-6 md:left-24 rail:left-[272px]">
      <PanelProvider>
        <Shell>{children}</Shell>
      </PanelProvider>
    </ToastProvider>
  );
}
