"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/atoms/Button";
import SearchInput from "@/components/molecules/SearchInput";
import StateMessage from "@/components/molecules/StateMessage";
import NotificationList from "@/components/organisms/NotificationList";
import { usePanel } from "@/features/customer/PanelProvider";
import { useNotifications } from "@/features/notifications/NotificationsProvider";

export default function NotificationsScreen() {
  const router = useRouter();
  const { appointments, openAppointment, requestConfirmation, closeConfirmation } = usePanel();
  const { notifications, markRead, removeNotification, removeAll } = useNotifications();
  const [query, setQuery] = useState("");

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

  const handleRemoveAll = () => {
    requestConfirmation({
      title: "Tüm bildirimler silinsin mi?",
      body: "Bütün bildirimlerin kalıcı olarak silinir. Bu işlem geri alınamaz.",
      confirmLabel: "Tümünü sil",
      onConfirm: async () => {
        await removeAll();
        closeConfirmation();
      },
    });
  };

  return (
    <div className="max-w-[860px]">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Bildirim ara" className="flex-[0_1_280px] max-sm:flex-1" />
        <Button variant="ghost" disabled={notifications.length === 0} onClick={handleRemoveAll}>
          Tümünü sil
        </Button>
      </div>
      {notifications.length === 0 ? (
        <StateMessage icon="bell" title="Henüz bildirim yok." />
      ) : (
        <NotificationList
          notifications={notifications}
          onSelect={handleSelect}
          onDelete={(notification) => removeNotification(notification.id)}
        />
      )}
    </div>
  );
}
