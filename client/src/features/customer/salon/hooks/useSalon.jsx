"use client";

import { useQuery } from "@tanstack/react-query";
import { salonKeys } from "@/features/customer/search/hooks/useSearch";
import { api } from "@/lib/api";

const REVIEW_LIMIT = 20;

export function useSalon(salonId) {
  return useQuery({
    queryKey: salonKeys.detail(salonId),
    queryFn: () => api.get(`/salons/${salonId}`),
    enabled: Boolean(salonId),
  });
}

export function useSalonReviews(salonId, limit = REVIEW_LIMIT) {
  return useQuery({
    queryKey: [...salonKeys.detail(salonId), "reviews", limit],
    queryFn: () => api.get(`/salons/${salonId}/reviews`, { params: { limit } }),
    enabled: Boolean(salonId),
  });
}
