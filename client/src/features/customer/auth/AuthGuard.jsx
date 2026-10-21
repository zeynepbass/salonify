"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Spinner from "@/components/atoms/Spinner";
import { useAuth } from "@/features/customer/auth/AuthProvider";

export default function AuthGuard({ role = "CUSTOMER", loginHref = "/giris", children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user } = useAuth();
  const allowed = status === "authenticated" && user.role === role;

  useEffect(() => {
    if (status === "loading" || allowed) return;
    router.replace(`${loginHref}?next=${encodeURIComponent(pathname)}`);
  }, [status, allowed, loginHref, pathname, router]);

  if (!allowed) {
    return (
      <div aria-busy="true" className="grid min-h-[40vh] place-items-center">
        <Spinner />
      </div>
    );
  }

  return children;
}
