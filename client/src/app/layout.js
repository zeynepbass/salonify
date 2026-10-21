import { Inter } from "next/font/google";
import { AuthProvider } from "@/features/auth/AuthProvider";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: {
    default: "SalonaBOX — Kuaför randevusu, onay beklemeden",
    template: "%s · SalonaBOX",
  },
  description: "Puanları, portföyleri ve gerçek boş saatleri karşılaştır. Uygun saati seç, randevun anında oluşsun.",
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
