"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Button from "@/components/atoms/Button";
import BottomNav from "@/components/molecules/BottomNav";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
import PageSpinner from "@/components/molecules/PageSpinner";
import StateMessage from "@/components/molecules/StateMessage";
import { ToastProvider } from "@/components/organisms/ToastProvider";
import AuthGuard from "@/features/shared/auth/AuthGuard";
import { useUnreadNotificationCount } from "@/features/shared/notifications/useNotifications";
import { PanelProvider, usePanel } from "@/features/panel/PanelProvider";
import AppointmentDrawer from "@/features/panel/components/AppointmentDrawer";
import AppointmentFormDialog from "@/features/panel/components/AppointmentFormDialog";
import PanelHeader from "@/features/panel/components/PanelHeader";
import PanelMenuSheet from "@/features/panel/components/PanelMenuSheet";
import PanelSidebar from "@/features/panel/components/PanelSidebar";
import { usePanelAppointments } from "@/features/panel/hooks/usePanelAppointments";
import { useMySalon } from "@/features/panel/hooks/useSalonProfile";
import { useServices } from "@/features/panel/hooks/useServices";
import { PANEL_MOBILE_NAV, PANEL_NAV, getActivePanelItem } from "@/features/panel/panelNav";
import { getErrorMessage } from "@/lib/api";
import { TODAY } from "@/lib/clock";
import { formatLongDate, getDateParts } from "@/lib/date";

function getSubtitle(href, { serviceCount, unreadCount }) {
  const subtitles = {
    "/panel": `${getDateParts(TODAY).weekday}, ${formatLongDate(TODAY)}`,
    "/panel/takvim": "Randevular, boş ve bloklu saatler",
    "/panel/randevular": "Tüm randevular",
    "/panel/hizmetler": serviceCount === null ? "Hizmetler" : `${serviceCount} hizmet`,
    "/panel/portfoy": "Herkese açık profilde gösterilen işler",
    "/panel/bildirimler": `${unreadCount} okunmamış`,
    "/panel/profil": "Müşterilerin gördüğü bilgiler",
    "/panel/calisma-saatleri": "Boş slotlar bu saatlerden üretilir",
  };
  return subtitles[href];
}

function PanelOverlays() {
  const panel = usePanel();
  const { data: appointments = [] } = usePanelAppointments();
  const selected = appointments.find((item) => item.id === panel.selectedAppointmentId);

  return (
    <>
      {selected && <AppointmentDrawer appointment={selected} onClose={panel.closeAppointment} />}
      {panel.appointmentForm && <AppointmentFormDialog draft={panel.appointmentForm} onClose={panel.closeAppointmentForm} />}
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
    </>
  );
}

function Shell({ children }) {
  const pathname = usePathname();
  const panel = usePanel();
  const salonQuery = useMySalon();
  const { data: services } = useServices();
  const unreadCount = useUnreadNotificationCount("salon");
  const [menuOpen, setMenuOpen] = useState(false);

  if (salonQuery.isPending) return <PageSpinner label="Panel yükleniyor" className="min-h-screen" />;

  if (salonQuery.isError) {
    return (
      <div className="page-container max-w-[760px] py-12">
        <StateMessage role="alert" icon="alert" tone="accent" title="Panel yüklenemedi." description={getErrorMessage(salonQuery.error)}>
          <Button variant="primary" disabled={salonQuery.isFetching} onClick={() => salonQuery.refetch()}>
            Tekrar dene
          </Button>
        </StateMessage>
      </div>
    );
  }

  const salon = salonQuery.data;
  const activeItem = getActivePanelItem(pathname);

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
      <PanelSidebar salon={salon} pathname={pathname} unreadCount={unreadCount} />
      <div className="flex min-w-0 flex-1 flex-col pb-[72px] md:pb-0">
        <PanelHeader
          title={activeItem.title ?? activeItem.label}
          subtitle={getSubtitle(activeItem.href, { serviceCount: services?.length ?? null, unreadCount })}
          unreadCount={unreadCount}
          onNewAppointment={() => panel.openAppointmentForm()}
        />
        <main className="w-full max-w-[1440px] flex-1 px-[clamp(16px,3vw,32px)] pt-7 pb-12">{children}</main>
      </div>

      <BottomNav label="Mobil menü" items={bottomItems} className="md:hidden" />
      {menuOpen && <PanelMenuSheet pathname={pathname} salonId={salon.id} onClose={() => setMenuOpen(false)} />}
      <PanelOverlays />
    </div>
  );
}

export default function PanelShell({ children }) {
  return (
    <ToastProvider className="bottom-[84px] left-4 md:bottom-6 md:left-24 rail:left-[272px]">
      <AuthGuard role="SALON" loginHref="/panel/giris">
        <PanelProvider>
          <Shell>{children}</Shell>
        </PanelProvider>
      </AuthGuard>
    </ToastProvider>
  );
}
