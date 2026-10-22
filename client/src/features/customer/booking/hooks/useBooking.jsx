"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { appointmentKeys, notificationKeys, salonKeys } from "@/lib/queryKeys";

export function useAvailability(salonId, serviceId, date) {
  return useQuery({
    queryKey: salonKeys.availability(salonId, { serviceId, date }),
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
