"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/atoms/Button";
import StateMessage from "@/components/molecules/StateMessage";
import NotificationList from "@/components/organisms/NotificationList";
import QueryState from "@/components/organisms/QueryState";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationList,
} from "@/features/shared/notifications/useNotifications";

export default function NotificationsPage() {
  const router = useRouter();
  const notificationsQuery = useNotificationList();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { unreadCount } = notificationsQuery;

  const handleSelect = (notification) => {
    if (notification.unread) markRead.mutate(notification.id);
    if (notification.href) router.push(notification.href);
  };

  return (
    <div className="page-container max-w-[860px] pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[clamp(30px,3.6vw,44px)]">Bildirimler</h1>
        <Button variant="ghost" disabled={unreadCount === 0 || markAllRead.isPending} onClick={() => markAllRead.mutate()}>
          Tümünü okundu işaretle
        </Button>
      </div>
      <QueryState
        query={notificationsQuery}
        errorTitle="Bildirimler yüklenemedi."
        isEmpty={(data) => data.notifications.length === 0}
        empty={<StateMessage icon="bell" title="Henüz bildirimin yok." description="Randevularınla ilgili gelişmeler burada görünür." />}
      >
        {(data) => <NotificationList notifications={data.notifications} onSelect={handleSelect} />}
      </QueryState>
    </div>
  );
}
