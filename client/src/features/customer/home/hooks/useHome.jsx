"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { salonKeys } from "@/lib/queryKeys";

const SHOWCASE_SIZE = 4;

export function useSalonShowcase(params) {
  const fullParams = { ...params, limit: SHOWCASE_SIZE };

  return useQuery({
    queryKey: salonKeys.list(fullParams),
    queryFn: () => api.get("/salons", { params: fullParams }),
    select: (data) => data.items,
  });
}

export function usePopularSalons() {
  return useSalonShowcase({ sort: "popular" });
}

export function useTopRatedSalons() {
  return useSalonShowcase({ sort: "rating", rating: 4.8 });
}
