"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/atoms/Button";
import StateMessage from "@/components/molecules/StateMessage";
import NotificationList from "@/components/organisms/NotificationList";
import { usePanel } from "@/features/dashboard/PanelProvider";

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, openAppointment } = usePanel();

  const handleSelect = (notification) => {
    markNotificationRead(notification.id);
    if (notification.appointmentId) openAppointment(notification.appointmentId);
    else if (notification.href) router.push(notification.href);
  };

  return (
    <div className="max-w-[860px]">
      <div className="mb-2 flex justify-end">
        <Button variant="ghost" disabled={unreadCount === 0} onClick={markAllNotificationsRead}>
          Tümünü okundu işaretle
        </Button>
      </div>
      {notifications.length === 0 ? (
        <StateMessage icon="bell" title="Henüz bildirim yok." />
      ) : (
        <NotificationList notifications={notifications} onSelect={handleSelect} />
      )}
    </div>
  );
}
