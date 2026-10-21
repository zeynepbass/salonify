"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/customer/auth/AuthProvider";
import { api, getErrorMessage } from "@/lib/api";
import { TODAY } from "@/lib/clock";
import { addDays } from "@/lib/date";
import { toWorkingHours, toWorkingHoursPayload } from "@/lib/schedule";

const PanelContext = createContext(null);

const APPOINTMENT_WINDOW = { pastDays: 60, futureDays: 90, limit: 200 };

const replaceById = (list, item) => list.map((current) => (current.id === item.id ? item : current));

function toPanelAppointment(appointment) {
  return {
    id: appointment.id,
    reference: appointment.reference,
    date: appointment.date,
    time: appointment.startTime,
    endTime: appointment.endTime,
    customer: appointment.customerName,
    phone: appointment.customerPhone,
    serviceId: appointment.service,
    service: { id: appointment.service, name: appointment.serviceName, duration: appointment.duration, price: appointment.price },
    status: appointment.status,
    source: appointment.source.toLowerCase(),
    note: appointment.notes,
  };
}

function toPortfolioItem(item) {
  return {
    id: item.id,
    image: item.image,
    title: item.title,
    customer: item.customerName || "Salon",
    rating: item.rating,
    date: item.createdAt.slice(0, 10),
    consent: item.hasConsent,
    published: item.isPublished,
  };
}

const sortByDate = (list) => [...list].sort((a, b) => a.date.localeCompare(b.date));

export function PanelProvider({ children }) {
  const { updateSession } = useAuth();
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [salon, setSalon] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [hours, setHours] = useState([]);
  const [closedDays, setClosedDays] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const loadAppointments = useCallback(async () => {
    const data = await api.get("/salon/me/appointments", {
      params: {
        from: addDays(TODAY, -APPOINTMENT_WINDOW.pastDays),
        to: addDays(TODAY, APPOINTMENT_WINDOW.futureDays),
        limit: APPOINTMENT_WINDOW.limit,
      },
    });
    setAppointments(data.items.map(toPanelAppointment));
  }, []);

  const loadPanel = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const mySalon = await api.get("/salon/me");
      const [myServices, workingHours, blockedDates, myPortfolio] = await Promise.all([
        api.get("/salon/me/services"),
        api.get(`/salons/${mySalon.id}/working-hours`),
        api.get(`/salons/${mySalon.id}/blocked-dates`),
        api.get("/salon/me/portfolio"),
        loadAppointments(),
      ]);

      setSalon(mySalon);
      setServices(myServices);
      setHours(toWorkingHours(workingHours));
      setClosedDays(blockedDates);
      setPortfolio(myPortfolio.map(toPortfolioItem));
      setStatus("ready");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setStatus("error");
    }
  }, [loadAppointments]);

  useEffect(() => {
    loadPanel();
  }, [loadPanel]);

  const setAppointmentStatus = useCallback(async (id, nextStatus) => {
    const updated =
      nextStatus === "CANCELLED"
        ? await api.delete(`/salon/me/appointments/${id}`, { data: {} })
        : await api.patch(`/salon/me/appointments/${id}`, { status: nextStatus });
    setAppointments((current) => replaceById(current, toPanelAppointment(updated)));
  }, []);

  const saveAppointment = useCallback(async (draft) => {
    const payload = {
      serviceId: draft.serviceId,
      date: draft.date,
      startTime: draft.time,
      notes: draft.note,
      customerName: draft.customer,
      customerPhone: draft.phone,
    };
    const saved = draft.id
      ? await api.patch(`/salon/me/appointments/${draft.id}`, payload)
      : await api.post("/salon/me/appointments", payload);
    const view = toPanelAppointment(saved);
    setAppointments((current) => (draft.id ? replaceById(current, view) : [...current, view]));
    return view;
  }, []);

  const saveService = useCallback(async (draft) => {
    const payload = { name: draft.name, duration: draft.duration, price: draft.price };
    const saved = draft.id
      ? await api.patch(`/salon/me/services/${draft.id}`, payload)
      : await api.post("/salon/me/services", payload);
    setServices((current) => (draft.id ? replaceById(current, saved) : [...current, saved]));
  }, []);

  const deleteService = useCallback(async (id) => {
    await api.delete(`/salon/me/services/${id}`);
    setServices((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateHours = useCallback((weekday, changes) => {
    setHours((current) => current.map((day) => (day.weekday === weekday ? { ...day, ...changes } : day)));
  }, []);

  const saveHours = useCallback(async () => {
    const saved = await api.patch("/salon/me/working-hours", { days: toWorkingHoursPayload(hours) });
    setHours(toWorkingHours(saved));
  }, [hours]);

  const addClosedDay = useCallback(async (day) => {
    const saved = await api.post("/salon/me/blocked-dates", day);
    setClosedDays((current) => sortByDate([...current, saved]));
    return saved;
  }, []);

  const removeClosedDay = useCallback(async (id) => {
    await api.delete(`/salon/me/blocked-dates/${id}`);
    setClosedDays((current) => current.filter((day) => day.id !== id));
  }, []);

  const togglePortfolioItem = useCallback(async (item) => {
    const saved = await api.patch(`/salon/me/portfolio/${item.id}`, { isPublished: !item.published });
    setPortfolio((current) => replaceById(current, toPortfolioItem(saved)));
  }, []);

  const updateSalon = useCallback(
    async (changes) => {
      const saved = await api.patch("/salon/me", changes);
      setSalon(saved);
      updateSession({ salon: saved });
      return saved;
    },
    [updateSession],
  );

  const openAppointmentForm = useCallback((draft = {}) => {
    setSelectedAppointmentId(null);
    setAppointmentForm(draft);
  }, []);

  const value = useMemo(
    () => ({
      status,
      error,
      salon,
      appointments,
      services,
      hours,
      closedDays,
      portfolio,
      selectedAppointmentId,
      appointmentForm,
      confirmation,
      reloadPanel: loadPanel,
      reloadAppointments: loadAppointments,
      setAppointmentStatus,
      saveAppointment,
      saveService,
      deleteService,
      updateHours,
      saveHours,
      addClosedDay,
      removeClosedDay,
      togglePortfolioItem,
      updateSalon,
      openAppointment: setSelectedAppointmentId,
      closeAppointment: () => setSelectedAppointmentId(null),
      openAppointmentForm,
      closeAppointmentForm: () => setAppointmentForm(null),
      requestConfirmation: setConfirmation,
      closeConfirmation: () => setConfirmation(null),
    }),
    [
      status,
      error,
      salon,
      appointments,
      services,
      hours,
      closedDays,
      portfolio,
      selectedAppointmentId,
      appointmentForm,
      confirmation,
      loadPanel,
      loadAppointments,
      setAppointmentStatus,
      saveAppointment,
      saveService,
      deleteService,
      updateHours,
      saveHours,
      addClosedDay,
      removeClosedDay,
      togglePortfolioItem,
      updateSalon,
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
