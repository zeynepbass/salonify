"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toPanelAppointment } from "@/features/panel/panelMappers";
import { api } from "@/lib/api";
import { TODAY } from "@/lib/clock";
import { addDays } from "@/lib/date";
import { notificationKeys, panelKeys, salonKeys } from "@/lib/queryKeys";

const APPOINTMENT_WINDOW = {
  from: addDays(TODAY, -60),
  to: addDays(TODAY, 90),
  limit: 200,
};

const appointmentsKey = panelKeys.appointments(APPOINTMENT_WINDOW);

export function usePanelAppointments() {
  return useQuery({
    queryKey: appointmentsKey,
    queryFn: () => api.get("/salon/me/appointments", { params: APPOINTMENT_WINDOW }),
    select: (data) => data.items.map(toPanelAppointment),
  });
}

function useApplyAppointment() {
  const queryClient = useQueryClient();

  return (saved, { isNew = false } = {}) => {
    queryClient.setQueryData(appointmentsKey, (current) => {
      if (!current) return current;
      const items = isNew ? [...current.items, saved] : current.items.map((item) => (item.id === saved.id ? saved : item));
      return { ...current, items };
    });
    queryClient.invalidateQueries({ queryKey: panelKeys.dashboard() });
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    queryClient.invalidateQueries({ queryKey: salonKeys.all });
  };
}

export function useUpdateAppointmentStatus(options = {}) {
  const applyAppointment = useApplyAppointment();

  return useMutation({
    mutationFn: ({ id, status }) =>
      status === "CANCELLED"
        ? api.delete(`/salon/me/appointments/${id}`, { data: {} })
        : api.patch(`/salon/me/appointments/${id}`, { status }),
    ...options,
    onSuccess: (saved, ...rest) => {
      applyAppointment(saved);
      options.onSuccess?.(saved, ...rest);
    },
  });
}

export function useSaveAppointment(options = {}) {
  const applyAppointment = useApplyAppointment();

  return useMutation({
    mutationFn: (draft) => {
      const payload = {
        serviceId: draft.serviceId,
        date: draft.date,
        startTime: draft.time,
        notes: draft.note,
        customerName: draft.customer,
        customerPhone: draft.phone,
      };
      return draft.id
        ? api.patch(`/salon/me/appointments/${draft.id}`, payload)
        : api.post("/salon/me/appointments", payload);
    },
    ...options,
    onSuccess: (saved, draft, ...rest) => {
      applyAppointment(saved, { isNew: !draft.id });
      options.onSuccess?.(saved, draft, ...rest);
    },
  });
}
