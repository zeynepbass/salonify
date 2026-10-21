import { Suspense } from "react";
import LoginScreen from "@/features/customer/screens/LoginScreen";

export const metadata = { title: "Panele giriş" };

export default function Page() {
  return (
    <Suspense>
      <LoginScreen />
    </Suspense>
  );
}
