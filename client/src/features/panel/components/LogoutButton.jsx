"use client";

import { useLogout } from "@/features/shared/auth/hooks/useAuthMutations";

export default function LogoutButton({ className, children }) {
  const logout = useLogout({ redirectTo: "/panel/giris" });

  return (
    <button type="button" disabled={logout.isPending} onClick={() => logout.mutate()} className={className}>
      {children}
    </button>
  );
}
