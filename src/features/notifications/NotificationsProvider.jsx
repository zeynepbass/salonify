"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { customerNotifications } from "@/data/mock/notifications";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(customerNotifications);

  const addNotification = useCallback((notification) => {
    setNotifications((current) => [
      { id: `n${current.length + 1}`, time: "Şimdi", unread: true, ...notification },
      ...current,
    ]);
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, unread: false } : item)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter((item) => item.unread).length,
      addNotification,
      markRead,
      markAllRead,
    }),
    [notifications, addNotification, markRead, markAllRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications yalnızca NotificationsProvider içinde kullanılabilir.");
  return context;
}
