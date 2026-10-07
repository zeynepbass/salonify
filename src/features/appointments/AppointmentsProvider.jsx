"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { customerAppointments } from "@/data/mock/appointments";
import { useNotifications } from "@/features/notifications/NotificationsProvider";
import { getSalon, getServiceName } from "@/lib/catalog";
import { formatDayMonth } from "@/lib/date";

const AppointmentsContext = createContext(null);

const FIRST_REFERENCE = 48207;

function describe(appointment) {
  return `${getSalon(appointment.salonId).name} · ${getServiceName(appointment.serviceId)} · ${formatDayMonth(appointment.date)}`;
}

export function AppointmentsProvider({ children }) {
  const [appointments, setAppointments] = useState(customerAppointments);
  const { addNotification } = useNotifications();

  const createAppointment = useCallback(
    ({ salonId, serviceId, date, time }) => {
      const sequence = appointments.length + 1;
      const appointment = {
        id: `a${sequence}`,
        reference: `SL-${FIRST_REFERENCE + sequence - 1}`,
        salonId,
        serviceId,
        date,
        time,
        status: "BOOKED",
        reviewed: false,
      };

      setAppointments((current) => [appointment, ...current]);
      addNotification({
        type: "booked",
        title: "Randevunuz oluşturuldu.",
        body: `${describe(appointment)}, ${time}`,
        href: `/randevularim/${appointment.id}`,
      });

      return appointment;
    },
    [appointments.length, addNotification],
  );

  const cancelAppointment = useCallback(
    (id) => {
      const appointment = appointments.find((item) => item.id === id);
      if (!appointment) return;

      setAppointments((current) => current.map((item) => (item.id === id ? { ...item, status: "CANCELLED" } : item)));
      addNotification({
        type: "cancelled",
        title: "Randevunuz iptal edildi.",
        body: describe(appointment),
        href: `/randevularim/${id}`,
      });
    },
    [appointments, addNotification],
  );

  const markReviewed = useCallback((id) => {
    setAppointments((current) => current.map((item) => (item.id === id ? { ...item, reviewed: true } : item)));
  }, []);

  const value = useMemo(
    () => ({ appointments, createAppointment, cancelAppointment, markReviewed }),
    [appointments, createAppointment, cancelAppointment, markReviewed],
  );

  return <AppointmentsContext.Provider value={value}>{children}</AppointmentsContext.Provider>;
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (!context) throw new Error("useAppointments yalnızca AppointmentsProvider içinde kullanılabilir.");
  return context;
}
