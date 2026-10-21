"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toAppointmentView } from "@/features/appointments/appointmentView";
import { notificationKeys } from "@/features/notifications/hooks/useNotifications";
import { api } from "@/lib/api";

const LIST_LIMIT = 50;

export const appointmentKeys = {
  all: ["appointments"],
  list: (scope) => ["appointments", "list", scope],
  detail: (appointmentId) => ["appointments", "detail", appointmentId],
};

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
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      options.onSuccess?.(...args);
    },
  });
}
