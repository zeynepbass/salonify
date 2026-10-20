"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/atoms/Button";
import StateMessage from "@/components/molecules/StateMessage";
import NotificationList from "@/components/organisms/NotificationList";
import { useNotifications } from "@/features/notifications/NotificationsProvider";

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const handleSelect = (notification) => {
    markRead(notification.id);
    if (notification.href) router.push(notification.href);
  };

  return (
    <div className="page-container max-w-[860px] pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[clamp(30px,3.6vw,44px)]">Bildirimler</h1>
        <Button variant="ghost" disabled={unreadCount === 0} onClick={markAllRead}>
          Tümünü okundu işaretle
        </Button>
      </div>
      {notifications.length === 0 ? (
        <StateMessage icon="bell" title="Henüz bildirimin yok." description="Randevularınla ilgili gelişmeler burada görünür." />
      ) : (
        <NotificationList notifications={notifications} onSelect={handleSelect} />
      )}
    </div>
  );
}
