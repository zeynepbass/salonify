import { Fraunces, Inter } from "next/font/google";
import { QueryProvider } from "@/components/organisms/QueryProvider";
import { AuthProvider } from "@/features/customer/auth/AuthProvider";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
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
  themeColor: "#fffdf9",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
