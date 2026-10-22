"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { appointmentKeys, notificationKeys, salonKeys } from "@/lib/queryKeys";

export function useAvailability(salonId, { serviceId, date, excludeAppointmentId } = {}, options = {}) {
  const params = { serviceId, date, ...(excludeAppointmentId && { excludeAppointmentId }) };

  return useQuery({
    queryKey: salonKeys.availability(salonId, params),
    queryFn: () => api.get(`/salons/${salonId}/availability`, { params }),
    select: (data) => data.slots,
    enabled: Boolean(salonId && serviceId && date),
    staleTime: 0,
    ...options,
  });
}

export function useBookAppointment(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ salonId, serviceId, date, startTime }) =>
      api.post("/appointments", { salonId, serviceId, date, startTime }),
    ...options,
    onSuccess: (appointment, ...rest) => {
      queryClient.setQueryData(appointmentKeys.detail(appointment.id), appointment);
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      options.onSuccess?.(appointment, ...rest);
    },
    onError: (error, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: [...salonKeys.detail(variables.salonId), "availability"] });
      options.onError?.(error, variables, ...rest);
    },
  });
}
