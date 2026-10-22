"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/atoms/Button";
import PageSpinner from "@/components/molecules/PageSpinner";
import StateMessage from "@/components/molecules/StateMessage";
import NotificationList from "@/components/organisms/NotificationList";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationList,
} from "@/features/shared/notifications/useNotifications";
import { getErrorMessage } from "@/lib/api";

export default function NotificationsPage() {
  const router = useRouter();
  const notificationsQuery = useNotificationList();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { notifications, unreadCount } = notificationsQuery;

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
      {notificationsQuery.isPending ? (
        <PageSpinner label="Bildirimler yükleniyor" className="min-h-[30vh]" />
      ) : notificationsQuery.isError ? (
        <StateMessage
          role="alert"
          icon="alert"
          tone="accent"
          title="Bildirimler yüklenemedi."
          description={getErrorMessage(notificationsQuery.error)}
        >
          <Button onClick={() => notificationsQuery.refetch()}>Tekrar dene</Button>
        </StateMessage>
      ) : notifications.length === 0 ? (
        <StateMessage icon="bell" title="Henüz bildirimin yok." description="Randevularınla ilgili gelişmeler burada görünür." />
      ) : (
        <NotificationList notifications={notifications} onSelect={handleSelect} />
      )}
    </div>
  );
}
