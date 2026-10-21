"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";

export default function LogoutButton({ className, onDone, children }) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleClick = async () => {
    await logout();
    onDone?.();
    router.replace("/panel/giris");
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
