"use client";

import { useCallback } from "react";
import { useToast } from "@/components/organisms/ToastProvider";
import { downloadCalendarEvent } from "@/lib/calendarFile";

export function useAddToCalendar() {
  const { showToast } = useToast();

  return useCallback(
    ({ reference, salon, service, date, time }) => {
      downloadCalendarEvent({
        reference,
        title: `${service.name} · ${salon.name}`,
        location: salon.address,
        date,
        time,
        duration: service.duration,
      });
      showToast("Takvim dosyası indirildi (.ics)");
    },
    [showToast],
  );
}
