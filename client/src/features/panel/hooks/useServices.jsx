"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { replaceById } from "@/features/panel/panelMappers";
import { api } from "@/lib/api";
import { panelKeys, salonKeys } from "@/lib/queryKeys";

export function useServices() {
  return useQuery({
    queryKey: panelKeys.services(),
    queryFn: () => api.get("/salon/me/services"),
  });
}

export function useSaveService(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name, duration, price }) => {
      const payload = { name, duration, price };
      return id ? api.patch(`/salon/me/services/${id}`, payload) : api.post("/salon/me/services", payload);
    },
    ...options,
    onSuccess: (saved, draft, ...rest) => {
      queryClient.setQueryData(panelKeys.services(), (current = []) =>
        draft.id ? replaceById(current, saved) : [...current, saved],
      );
      queryClient.invalidateQueries({ queryKey: salonKeys.all });
      options.onSuccess?.(saved, draft, ...rest);
    },
  });
}

export function useDeleteService(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/salon/me/services/${id}`),
    ...options,
    onSuccess: (response, id, ...rest) => {
      queryClient.setQueryData(panelKeys.services(), (current = []) => current.filter((item) => item.id !== id));
      queryClient.invalidateQueries({ queryKey: salonKeys.all });
      options.onSuccess?.(response, id, ...rest);
    },
  });
}
