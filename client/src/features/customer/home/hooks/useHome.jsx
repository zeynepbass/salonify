"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { salonKeys } from "@/lib/queryKeys";

export const SHOWCASE_SIZE = 4;

function useShowcaseSalons(params) {
  const fullParams = { ...params, limit: SHOWCASE_SIZE };

  return useQuery({
    queryKey: salonKeys.list(fullParams),
    queryFn: () => api.get("/salons", { params: fullParams }),
    select: (data) => data.items,
  });
}

export function useNearbySalons(params) {
  return useShowcaseSalons(params);
}

export function usePopularSalons() {
  return useShowcaseSalons({ sort: "popular" });
}

export function useTopRatedSalons() {
  return useShowcaseSalons({ sort: "rating", rating: 4.8 });
}
