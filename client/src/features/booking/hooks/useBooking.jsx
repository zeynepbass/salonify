"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentKeys } from "@/features/appointments/hooks/useAppointment";
import { notificationKeys } from "@/features/notifications/hooks/useNotifications";
import { salonKeys } from "@/features/search/hooks/useSearch";
import { api } from "@/lib/api";

export function useAvailability(salonId, serviceId, date) {
  return useQuery({
    queryKey: [...salonKeys.detail(salonId), "availability", serviceId, date],
    queryFn: () => api.get(`/salons/${salonId}/availability`, { params: { serviceId, date } }),
    select: (data) => data.slots,
    enabled: Boolean(salonId && serviceId && date),
  });
}

export function useBookAppointment(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ salonId, serviceId, date, startTime }) =>
      api.post("/appointments", { salonId, serviceId, date, startTime }),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      options.onSuccess?.(...args);
    },
    onError: (error, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: [...salonKeys.detail(variables.salonId), "availability"] });
      options.onError?.(error, variables, ...rest);
    },
  });
}
