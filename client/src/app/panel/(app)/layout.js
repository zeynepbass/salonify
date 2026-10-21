import PanelShell from "@/features/panel/components/PanelShell";

export const metadata = {
  title: {
    default: "Kuaför Paneli",
    template: "%s · Kuaför Paneli · SalonaBOX",
  },
};

export default function Layout({ children }) {
  return <PanelShell>{children}</PanelShell>;
}
