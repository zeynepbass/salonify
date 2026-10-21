"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { api } from "@/lib/api";
import { toNotificationView } from "@/lib/notifications";

const NotificationsContext = createContext(null);

const NOTIFICATION_LIMIT = 50;

export function NotificationsProvider({ audience = "customer", children }) {
  const { status } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await api.get("/notifications", { params: { limit: NOTIFICATION_LIMIT } });
      setNotifications(data.items.map((item) => toNotificationView(item, { audience })));
      setUnreadCount(data.unreadCount);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [audience]);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadNotifications();
  }, [status, loadNotifications]);

  const markRead = useCallback(
    async (id) => {
      const target = notifications.find((item) => item.id === id);
      if (!target?.unread) return;

      setNotifications((current) => current.map((item) => (item.id === id ? { ...item, unread: false } : item)));
      setUnreadCount((count) => Math.max(0, count - 1));
      try {
        await api.patch(`/notifications/${id}/read`);
      } catch {
        loadNotifications();
      }
    },
    [notifications, loadNotifications],
  );

  const markAllRead = useCallback(async () => {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
    setUnreadCount(0);
    try {
      await api.patch("/notifications/read-all");
    } catch {
      loadNotifications();
    }
  }, [loadNotifications]);

  const removeNotification = useCallback(
    async (id) => {
      const target = notifications.find((item) => item.id === id);
      if (!target) return;

      setNotifications((current) => current.filter((item) => item.id !== id));
      if (target.unread) setUnreadCount((count) => Math.max(0, count - 1));
      try {
        await api.delete(`/notifications/${id}`);
      } catch {
        loadNotifications();
      }
    },
    [notifications, loadNotifications],
  );

  const removeAll = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);
    try {
      await api.delete("/notifications");
    } catch {
      loadNotifications();
    }
  }, [loadNotifications]);

  const value = useMemo(
    () => ({
      notifications: status === "authenticated" ? notifications : [],
      unreadCount: status === "authenticated" ? unreadCount : 0,
      loading: status === "authenticated" && loading,
      reloadNotifications: loadNotifications,
      markRead,
      markAllRead,
      removeNotification,
      removeAll,
    }),
    [status, notifications, unreadCount, loading, loadNotifications, markRead, markAllRead, removeNotification, removeAll],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications yalnızca NotificationsProvider içinde kullanılabilir.");
  return context;
}
