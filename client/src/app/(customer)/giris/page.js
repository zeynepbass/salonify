import { Suspense } from "react";
import CustomerLoginPage from "@/features/auth/CustomerLoginPage";

export const metadata = { title: "Giriş yap" };

export default function Page() {
  return (
    <Suspense>
      <CustomerLoginPage />
    </Suspense>
  );
}
