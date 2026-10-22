"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { panelKeys } from "@/lib/queryKeys";

export function useDashboard() {
  return useQuery({
    queryKey: panelKeys.dashboard(),
    queryFn: () => api.get("/salon/me/dashboard"),
  });
}
