"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const PanelContext = createContext(null);

export function PanelProvider({ children }) {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const openAppointmentForm = useCallback((draft = {}) => {
    setSelectedAppointmentId(null);
    setAppointmentForm(draft);
  }, []);

  const closeAppointment = useCallback(() => setSelectedAppointmentId(null), []);
  const closeAppointmentForm = useCallback(() => setAppointmentForm(null), []);
  const closeConfirmation = useCallback(() => setConfirmation(null), []);

  const value = useMemo(
    () => ({
      selectedAppointmentId,
      appointmentForm,
      confirmation,
      openAppointment: setSelectedAppointmentId,
      closeAppointment,
      openAppointmentForm,
      closeAppointmentForm,
      requestConfirmation: setConfirmation,
      closeConfirmation,
    }),
    [selectedAppointmentId, appointmentForm, confirmation, closeAppointment, openAppointmentForm, closeAppointmentForm, closeConfirmation],
  );

  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}

export function usePanel() {
  const context = useContext(PanelContext);
  if (!context) throw new Error("usePanel yalnızca PanelProvider içinde kullanılabilir.");
  return context;
}
