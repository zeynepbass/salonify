"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/atoms/Button";
import StateMessage from "@/components/molecules/StateMessage";
import NotificationList from "@/components/organisms/NotificationList";
import { usePanel } from "@/features/dashboard/PanelProvider";
import { useNotifications } from "@/features/notifications/NotificationsProvider";

export default function NotificationsScreen() {
  const router = useRouter();
  const { appointments, openAppointment } = usePanel();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const handleSelect = (notification) => {
    markRead(notification.id);
    if (notification.appointmentId && appointments.some((item) => item.id === notification.appointmentId)) {
      openAppointment(notification.appointmentId);
    } else if (notification.href) {
      router.push(notification.href);
    } else if (notification.appointmentId) {
      router.push("/panel/randevular?sekme=tumu");
    }
  };

  return (
    <div className="max-w-[860px]">
      <div className="mb-2 flex justify-end">
        <Button variant="ghost" disabled={unreadCount === 0} onClick={markAllRead}>
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
