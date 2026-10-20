export const PANEL_NAV = [
  { href: "/panel", label: "Dashboard", shortLabel: "Panel", icon: "dashboard" },
  { href: "/panel/takvim", label: "Takvim", icon: "calendar" },
  { href: "/panel/randevular", label: "Randevular", icon: "list" },
  { href: "/panel/hizmetler", label: "Hizmetler", icon: "scissors" },
  { href: "/panel/portfoy", label: "Portföy", icon: "image" },
  { href: "/panel/bildirimler", label: "Bildirimler", shortLabel: "Bildirim", icon: "bell" },
  { href: "/panel/profil", label: "Profil", title: "Salon profili", icon: "store" },
  { href: "/panel/calisma-saatleri", label: "Çalışma Saatleri", title: "Çalışma saatleri", icon: "clock" },
];

export const PANEL_MOBILE_NAV = ["/panel", "/panel/takvim", "/panel/randevular", "/panel/bildirimler"];

export function getActivePanelItem(pathname) {
  return PANEL_NAV.find((item) => item.href === pathname) ?? PANEL_NAV[0];
}
