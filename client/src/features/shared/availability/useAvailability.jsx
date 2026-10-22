"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { salonKeys } from "@/lib/queryKeys";

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
