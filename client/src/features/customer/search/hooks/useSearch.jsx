"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { salonKeys } from "@/lib/queryKeys";

export function useSalons(params, options = {}) {
  return useQuery({
    queryKey: salonKeys.list(params),
    queryFn: () => api.get("/salons", { params }),
    placeholderData: keepPreviousData,
    select: (data) => ({
      salons: data.items,
      total: data.pagination.total,
      pageCount: data.pagination.totalPages,
    }),
    ...options,
  });
}
