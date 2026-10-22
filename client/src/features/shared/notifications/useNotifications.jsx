"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/shared/auth/AuthProvider";
import { api } from "@/lib/api";
import { toNotificationView } from "@/lib/notifications";
import { notificationKeys } from "@/lib/queryKeys";

const NOTIFICATION_LIMIT = 50;
const REFRESH_INTERVAL = 60 * 1000;
const EMPTY = { notifications: [], unreadCount: 0 };

export function useNotificationList(audience = "customer") {
  const { status } = useAuth();
  const enabled = status === "authenticated";

  const query = useQuery({
    queryKey: notificationKeys.list(audience),
    queryFn: () => api.get("/notifications", { params: { limit: NOTIFICATION_LIMIT } }),
    select: (data) => ({
      notifications: data.items.map((item) => toNotificationView(item, { audience })),
      unreadCount: data.unreadCount,
    }),
    enabled,
    refetchInterval: REFRESH_INTERVAL,
  });

  return { ...query, ...(enabled && query.data ? query.data : EMPTY) };
}

export function useUnreadNotificationCount(audience = "customer") {
  return useNotificationList(audience).unreadCount;
}

function useOptimisticNotificationMutation({ mutationFn, update }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const snapshot = queryClient.getQueriesData({ queryKey: notificationKeys.all });
      queryClient.setQueriesData({ queryKey: notificationKeys.all }, (data) => (data ? update(data, variables) : data));
      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

const countUnread = (items) => items.filter((item) => !item.isRead).length;

export function useMarkNotificationRead() {
  return useOptimisticNotificationMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    update: (data, id) => {
      const items = data.items.map((item) => (item.id === id ? { ...item, isRead: true } : item));
      const changed = countUnread(data.items) - countUnread(items);
      return { ...data, items, unreadCount: Math.max(0, data.unreadCount - changed) };
    },
  });
}

export function useMarkAllNotificationsRead() {
  return useOptimisticNotificationMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    update: (data) => ({ ...data, items: data.items.map((item) => ({ ...item, isRead: true })), unreadCount: 0 }),
  });
}

export function useDeleteNotification() {
  return useOptimisticNotificationMutation({
    mutationFn: (id) => api.delete(`/notifications/${id}`),
    update: (data, id) => {
      const target = data.items.find((item) => item.id === id);
      return {
        ...data,
        items: data.items.filter((item) => item.id !== id),
        unreadCount: target && !target.isRead ? Math.max(0, data.unreadCount - 1) : data.unreadCount,
      };
    },
  });
}

export function useDeleteAllNotifications() {
  return useOptimisticNotificationMutation({
    mutationFn: () => api.delete("/notifications"),
    update: (data) => ({ ...data, items: [], unreadCount: 0 }),
  });
}
