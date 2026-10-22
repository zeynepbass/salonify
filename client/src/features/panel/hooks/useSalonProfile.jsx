"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/customer/auth/AuthProvider";
import { api } from "@/lib/api";
import { panelKeys, salonKeys } from "@/lib/queryKeys";

export function useMySalon() {
  return useQuery({
    queryKey: panelKeys.salon(),
    queryFn: () => api.get("/salon/me"),
  });
}

export function useUpdateSalon(options = {}) {
  const queryClient = useQueryClient();
  const { updateSession } = useAuth();

  return useMutation({
    mutationFn: (changes) => api.patch("/salon/me", changes),
    ...options,
    onSuccess: (salon, ...rest) => {
      queryClient.setQueryData(panelKeys.salon(), salon);
      queryClient.invalidateQueries({ queryKey: salonKeys.all });
      updateSession({ salon });
      options.onSuccess?.(salon, ...rest);
    },
  });
}

export function useUploadCover(options = {}) {
  const update = useUpdateSalon();

  return useMutation({
    mutationFn: async (file) => {
      const upload = await api.uploadImage(file);
      return update.mutateAsync({ coverImage: upload.url });
    },
    ...options,
  });
}
