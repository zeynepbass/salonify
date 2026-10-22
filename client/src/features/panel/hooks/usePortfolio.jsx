"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toPortfolioItem } from "@/features/panel/panelMappers";
import { api } from "@/lib/api";
import { panelKeys, salonKeys } from "@/lib/queryKeys";

export function usePortfolio() {
  return useQuery({
    queryKey: panelKeys.portfolio(),
    queryFn: () => api.get("/salon/me/portfolio"),
    select: (items) => items.map(toPortfolioItem),
  });
}

export function useTogglePortfolioItem(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item) => api.patch(`/salon/me/portfolio/${item.id}`, { isPublished: !item.published }),
    ...options,
    onSuccess: (saved, ...rest) => {
      queryClient.setQueryData(panelKeys.portfolio(), (current = []) =>
        current.map((item) => (item.id === saved.id ? saved : item)),
      );
      queryClient.invalidateQueries({ queryKey: salonKeys.all });
      options.onSuccess?.(saved, ...rest);
    },
  });
}
