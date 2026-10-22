"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toAppointmentView } from "@/features/customer/appointments/appointmentView";
import { api } from "@/lib/api";
import { appointmentKeys, notificationKeys, salonKeys } from "@/lib/queryKeys";

const LIST_LIMIT = 50;

export function useAppointments(scope) {
  return useQuery({
    queryKey: appointmentKeys.list(scope),
    queryFn: () => api.get("/appointments", { params: { scope, limit: LIST_LIMIT } }),
    select: (data) => ({
      appointments: data.items.map(toAppointmentView),
      total: data.pagination.total,
    }),
  });
}

export function useAppointment(appointmentId) {
  return useQuery({
    queryKey: appointmentKeys.detail(appointmentId),
    queryFn: () => api.get(`/appointments/${appointmentId}`),
    select: toAppointmentView,
    enabled: Boolean(appointmentId),
  });
}

export function useCancelAppointment(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, reason }) =>
      api.delete(`/appointments/${appointmentId}`, { data: reason ? { reason } : {} }),
    ...options,
    onSuccess: (cancelled, ...rest) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      if (cancelled?.salon?.id) queryClient.invalidateQueries({ queryKey: salonKeys.detail(cancelled.salon.id) });
      options.onSuccess?.(cancelled, ...rest);
    },
  });
}
