"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toNotificationView } from "@/lib/notifications";

const NOTIFICATION_LIMIT = 50;

export const notificationKeys = {
  all: ["notifications"],
  list: (audience) => ["notifications", audience],
};

export function useNotificationList({ audience = "customer", enabled = true } = {}) {
  return useQuery({
    queryKey: notificationKeys.list(audience),
    queryFn: () => api.get("/notifications", { params: { limit: NOTIFICATION_LIMIT } }),
    select: (data) => ({
      notifications: data.items.map((item) => toNotificationView(item, { audience })),
      unreadCount: data.unreadCount,
    }),
    enabled,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
