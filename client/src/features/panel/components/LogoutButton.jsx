"use client";

import { useRouter } from "next/navigation";
import { useLogout } from "@/features/customer/auth/hooks/useAuth";

export default function LogoutButton({ className, onDone, children }) {
  const router = useRouter();
  const logout = useLogout({
    onSettled: () => {
      onDone?.();
      router.replace("/panel/giris");
    },
  });

  return (
    <button type="button" disabled={logout.isPending} onClick={() => logout.mutate()} className={className}>
      {children}
    </button>
  );
}
