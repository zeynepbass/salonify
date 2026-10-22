"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/atoms/Button";
import SearchInput from "@/components/molecules/SearchInput";
import StateMessage from "@/components/molecules/StateMessage";
import NotificationList from "@/components/organisms/NotificationList";
import { useSearchFilter } from "@/lib/hooks";
import { usePanelAppointments } from "@/features/panel/hooks/usePanelAppointments";
import { usePanel } from "@/features/panel/PanelProvider";
import {
  useDeleteAllNotifications,
  useDeleteNotification,
  useMarkNotificationRead,
  useNotificationList,
} from "@/features/shared/notifications/useNotifications";

const getSearchFields = (notification) => [notification.title, notification.body];

export default function NotificationsScreen() {
  const router = useRouter();
  const { openAppointment, requestConfirmation, closeConfirmation } = usePanel();
  const { data: appointments = [] } = usePanelAppointments();
  const { notifications } = useNotificationList("salon");
  const markRead = useMarkNotificationRead();
  const removeNotification = useDeleteNotification();
  const removeAll = useDeleteAllNotifications();
  const [query, setQuery] = useState("");
  const { results } = useSearchFilter(notifications, query, getSearchFields);

  const handleSelect = (notification) => {
    if (notification.unread) markRead.mutate(notification.id);
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
      onConfirm: () => {
        removeAll.mutate();
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
      ) : results.length === 0 ? (
        <StateMessage icon="search" title="Aramanla eşleşen bildirim yok." />
      ) : (
        <NotificationList
          notifications={results}
          onSelect={handleSelect}
          onDelete={(notification) => removeNotification.mutate(notification.id)}
        />
      )}
    </div>
  );
}
