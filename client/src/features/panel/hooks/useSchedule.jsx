"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMySalon } from "@/features/panel/hooks/useSalonProfile";
import { sortByDate } from "@/features/panel/panelMappers";
import { api } from "@/lib/api";
import { combineQueries } from "@/lib/combineQueries";
import { panelKeys, salonKeys } from "@/lib/queryKeys";
import { toWorkingHours, toWorkingHoursPayload } from "@/lib/schedule";

export function useWorkingHours(salonId) {
  return useQuery({
    queryKey: panelKeys.workingHours(salonId),
    queryFn: () => api.get(`/salons/${salonId}/working-hours`),
    select: toWorkingHours,
    enabled: Boolean(salonId),
  });
}

export function useBlockedDates(salonId) {
  return useQuery({
    queryKey: panelKeys.blockedDates(salonId),
    queryFn: () => api.get(`/salons/${salonId}/blocked-dates`),
    select: sortByDate,
    enabled: Boolean(salonId),
  });
}

export function usePanelSchedule() {
  const salonQuery = useMySalon();
  const salonId = salonQuery.data?.id;
  const hoursQuery = useWorkingHours(salonId);
  const closedDaysQuery = useBlockedDates(salonId);
  const combined = combineQueries(salonQuery, hoursQuery, closedDaysQuery);

  return {
    ...combined,
    salonId,
    hours: hoursQuery.data ?? [],
    closedDays: closedDaysQuery.data ?? [],
  };
}

function useInvalidateSchedule() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: panelKeys.dashboard() });
    queryClient.invalidateQueries({ queryKey: salonKeys.all });
  };
}

export function useSaveWorkingHours(salonId, options = {}) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateSchedule();

  return useMutation({
    mutationFn: (hours) => api.patch("/salon/me/working-hours", { days: toWorkingHoursPayload(hours) }),
    ...options,
    onSuccess: (saved, ...rest) => {
      queryClient.setQueryData(panelKeys.workingHours(salonId), saved);
      invalidate();
      options.onSuccess?.(saved, ...rest);
    },
  });
}

export function useAddBlockedDate(salonId, options = {}) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateSchedule();

  return useMutation({
    mutationFn: (day) => api.post("/salon/me/blocked-dates", day),
    ...options,
    onSuccess: (saved, ...rest) => {
      queryClient.setQueryData(panelKeys.blockedDates(salonId), (current = []) => [...current, saved]);
      invalidate();
      options.onSuccess?.(saved, ...rest);
    },
  });
}

export function useRemoveBlockedDate(salonId, options = {}) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateSchedule();

  return useMutation({
    mutationFn: (id) => api.delete(`/salon/me/blocked-dates/${id}`),
    ...options,
    onSuccess: (response, id, ...rest) => {
      queryClient.setQueryData(panelKeys.blockedDates(salonId), (current = []) => current.filter((day) => day.id !== id));
      invalidate();
      options.onSuccess?.(response, id, ...rest);
    },
  });
}
