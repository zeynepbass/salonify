"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { salonAppointments } from "@/data/mock/appointments";
import { salonNotifications } from "@/data/mock/notifications";
import { portfolioItems } from "@/data/mock/portfolio";
import { services as serviceCatalog } from "@/data/mock/services";
import { closedDays as initialClosedDays, workingHours } from "@/data/mock/workingHours";

const PanelContext = createContext(null);

const replaceById = (list, id, update) => list.map((item) => (item.id === id ? { ...item, ...update(item) } : item));

export function PanelProvider({ children }) {
  const [appointments, setAppointments] = useState(salonAppointments);
  const [services, setServices] = useState(serviceCatalog);
  const [hours, setHours] = useState(workingHours);
  const [closedDays, setClosedDays] = useState(initialClosedDays);
  const [portfolio, setPortfolio] = useState(portfolioItems);
  const [notifications, setNotifications] = useState(salonNotifications);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const setAppointmentStatus = useCallback((id, status) => {
    setAppointments((current) => replaceById(current, id, () => ({ status })));
  }, []);

  const saveAppointment = useCallback((draft) => {
    setAppointments((current) =>
      draft.id
        ? replaceById(current, draft.id, () => draft)
        : [...current, { ...draft, id: Math.max(...current.map((item) => item.id)) + 1, status: "BOOKED", source: "manual" }],
    );
  }, []);

  const saveService = useCallback((draft) => {
    setServices((current) =>
      draft.id ? replaceById(current, draft.id, () => draft) : [...current, { ...draft, id: `hizmet-${current.length + 1}` }],
    );
  }, []);

  const toggleService = useCallback((id) => {
    setServices((current) => replaceById(current, id, (item) => ({ active: !item.active })));
  }, []);

  const deleteService = useCallback((id) => {
    setServices((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateHours = useCallback((weekday, changes) => {
    setHours((current) => current.map((day) => (day.weekday === weekday ? { ...day, ...changes } : day)));
  }, []);

  const addClosedDay = useCallback((day) => {
    setClosedDays((current) => [...current, day].sort((a, b) => a.date.localeCompare(b.date)));
  }, []);

  const removeClosedDay = useCallback((date) => {
    setClosedDays((current) => current.filter((day) => day.date !== date));
  }, []);

  const togglePortfolioItem = useCallback((id) => {
    setPortfolio((current) => replaceById(current, id, (item) => ({ published: !item.published })));
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((current) => replaceById(current, id, () => ({ unread: false })));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
  }, []);

  const openAppointmentForm = useCallback((draft = {}) => {
    setSelectedAppointmentId(null);
    setAppointmentForm(draft);
  }, []);

  const value = useMemo(
    () => ({
      appointments,
      services,
      hours,
      closedDays,
      portfolio,
      notifications,
      unreadCount: notifications.filter((item) => item.unread).length,
      selectedAppointmentId,
      appointmentForm,
      confirmation,
      setAppointmentStatus,
      saveAppointment,
      saveService,
      toggleService,
      deleteService,
      updateHours,
      addClosedDay,
      removeClosedDay,
      togglePortfolioItem,
      markNotificationRead,
      markAllNotificationsRead,
      openAppointment: setSelectedAppointmentId,
      closeAppointment: () => setSelectedAppointmentId(null),
      openAppointmentForm,
      closeAppointmentForm: () => setAppointmentForm(null),
      requestConfirmation: setConfirmation,
      closeConfirmation: () => setConfirmation(null),
    }),
    [
      appointments,
      services,
      hours,
      closedDays,
      portfolio,
      notifications,
      selectedAppointmentId,
      appointmentForm,
      confirmation,
      setAppointmentStatus,
      saveAppointment,
      saveService,
      toggleService,
      deleteService,
      updateHours,
      addClosedDay,
      removeClosedDay,
      togglePortfolioItem,
      markNotificationRead,
      markAllNotificationsRead,
      openAppointmentForm,
    ],
  );

  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}

export function usePanel() {
  const context = useContext(PanelContext);
  if (!context) throw new Error("usePanel yalnızca PanelProvider içinde kullanılabilir.");
  return context;
}
