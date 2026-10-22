"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/shared/auth/AuthProvider";

export function getSafeRedirect(value, { prefix = "/", fallback }) {
  const safe = typeof value === "string" && value.startsWith(prefix) && !value.startsWith("//");
  return safe ? value : fallback;
}

export function useRedirectWhenSignedIn(role, { prefix, fallback }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, user } = useAuth();
  const target = getSafeRedirect(searchParams.get("next"), { prefix, fallback });

  useEffect(() => {
    if (status === "authenticated" && user.role === role) router.replace(target);
  }, [status, user, role, target, router]);
}
