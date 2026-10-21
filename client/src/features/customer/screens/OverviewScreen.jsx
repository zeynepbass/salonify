"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import StateMessage from "@/components/molecules/StateMessage";
import StatusTag from "@/components/molecules/StatusTag";
import { getNotificationIcon } from "@/components/organisms/NotificationList";
import Spinner from "@/components/atoms/Spinner";
import { usePanel } from "@/features/customer/PanelProvider";
import { getDayBounds } from "@/features/customer/scheduling";
import { useAppointmentActions } from "@/features/customer/useAppointmentActions";
import { usePanelAppointments } from "@/features/customer/usePanelAppointments";
import { useNotifications } from "@/features/notifications/NotificationsProvider";
import { api, getErrorMessage } from "@/lib/api";
import { TODAY } from "@/lib/clock";
import { cn } from "@/lib/cn";
import { formatDayMonth } from "@/lib/date";
import { formatDuration, formatPrice } from "@/lib/format";

const SLOT_MINUTES = 30;

function describeFreeSlots(count) {
  if (count === 0) return "Bugün yeni randevu alınabilecek boş saat kalmadı.";
  return `Bugün yeni randevu alınabilecek ${count} boş zaman dilimi (${SLOT_MINUTES}'ar dakika) kaldı.`;
}

function StatCard({ stat }) {
  return (
    <Link
      href={stat.href}
      className="flex flex-col items-center gap-1 border-b border-line px-3 py-5 text-center transition-colors hover:bg-surface"
    >
      <span className="flex items-center justify-center gap-2 text-[13px] font-semibold">
        <Icon name={stat.icon} />
        {stat.label}
      </span>
      <span className={cn("text-[52px] leading-none font-extrabold", stat.alert && "text-accent-700")}>
        {stat.value}
      </span>
      <span className="text-[12px] text-neutral-700">{stat.caption}</span>
    </Link>
  );
}

function AgendaRow({ appointment, onView, onComplete }) {
  const { service } = appointment;

  return (
    <div className={cn("flex flex-wrap items-center gap-4 border-b border-line py-3.5", appointment.inactive && "opacity-60")}>
      <div className="w-16 flex-none">
        <div className="text-[18px] font-extrabold">{appointment.time}</div>
        <div className="text-[12px] text-neutral-700">– {appointment.endTime}</div>
      </div>
      <div className="min-w-0 flex-[1_1_200px]">
        <div className="font-bold">{appointment.customer}</div>
        <div className="text-[13px] text-neutral-700">
          {service.name} · {formatDuration(service.duration)} · {formatPrice(service.price)}
        </div>
      </div>
      <StatusTag status={appointment.status} />
      <div className="flex gap-1.5">
        {appointment.canComplete && (
          <Button className="gap-1.5" onClick={onComplete}>
            <Icon name="check" size={14} />
            Tamamlandı
          </Button>
        )}
        <Button variant="ghost" aria-label={`${appointment.customer} randevusunu görüntüle`} onClick={onView}>
          Görüntüle
        </Button>
      </div>
    </div>
  );
}

export default function OverviewScreen() {
  const panel = usePanel();
  const actions = useAppointmentActions();
  const appointments = usePanelAppointments();
  const { notifications } = useNotifications();
  const [dashboard, setDashboard] = useState({ status: "loading", data: null, error: null });

  useEffect(() => {
    let ignore = false;
    api
      .get("/salon/me/dashboard")
      .then((data) => !ignore && setDashboard({ status: "success", data, error: null }))
      .catch((error) => !ignore && setDashboard({ status: "error", data: null, error: getErrorMessage(error) }));
    return () => {
      ignore = true;
    };
  }, [panel.appointments]);

  if (dashboard.status === "loading") {
    return (
      <div aria-busy="true" className="grid min-h-[40vh] place-items-center">
        <Spinner />
      </div>
    );
  }

  if (dashboard.status === "error") {
    return <StateMessage role="alert" icon="alert" tone="accent" title="Özet yüklenemedi." description={dashboard.error} />;
  }

  const summary = dashboard.data;
  const todayIds = new Set(summary.todayAppointments.map((item) => item.id));
  const todayList = appointments.filter((item) => todayIds.has(item.id)).sort((a, b) => a.start - b.start);

  const stats = [
    { label: "Bugünkü Randevular", value: summary.todayAppointments.length, caption: formatDayMonth(summary.date), icon: "calendarCheck", href: "/panel/randevular?sekme=bugun" },
    { label: "Yaklaşan", value: summary.upcomingCount, caption: "Bugün ve sonrası", icon: "clock", href: "/panel/randevular?sekme=yaklasan" },
    {
      label: "Tamamlanan",
      value: summary.completedAppointments,
      caption: "Bu hafta",
      icon: "checkCircle",
      href: "/panel/randevular?sekme=gecmis",
    },
    {
      label: "İptal",
      value: summary.cancelledAppointments,
      caption: "Bu hafta",
      icon: "closeCircle",
      href: "/panel/randevular?sekme=gecmis",
      alert: summary.cancelledAppointments > 0,
    },
  ];

  const bounds = getDayBounds(panel.hours, panel.closedDays, TODAY);
  const { occupancy, freeSlotCount } = summary.today;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-x-5 border-t-2 border-ink lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-8">
        <section className="min-w-0 flex-[2_1_560px]">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-[22px]">Sonraki randevular</h2>
            <Button variant="ghost" href="/panel/takvim">
              Takvimde gör
            </Button>
          </div>
          {todayList.length === 0 ? (
            <StateMessage icon="calendar" title="Bugün için randevu yok." description="Yeni bir randevu ekleyebilir ya da takvimi kontrol edebilirsin." />
          ) : (
            <div className="border-t-2 border-line">
              {todayList.map((appointment) => (
                <AgendaRow
                  key={appointment.id}
                  appointment={appointment}
                  onView={() => panel.openAppointment(appointment.id)}
                  onComplete={() => actions.complete(appointment)}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
          <div className="bg-surface p-5">
            <h2 className="eyebrow mb-3 text-neutral-700">Bugünün doluluğu</h2>
            <div className="text-[36px] leading-none font-extrabold">%{occupancy}</div>
            <div className="mt-3 mb-2 h-2 bg-neutral-200" role="progressbar" aria-valuenow={occupancy} aria-valuemin={0} aria-valuemax={100} aria-label="Bugünün doluluğu">
              <div className="h-full bg-ink" style={{ width: `${occupancy}%` }} />
            </div>
            <div className="text-[12px] text-neutral-700">
              {bounds.closed ? "Salon bugün kapalı" : describeFreeSlots(freeSlotCount)}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-[18px]">Son bildirimler</h2>
              <Button variant="ghost" href="/panel/bildirimler">
                Tümü
              </Button>
            </div>
            {notifications.length === 0 && <p className="border-t border-line py-3 text-[13px] text-neutral-700">Henüz bildirim yok.</p>}
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="flex gap-3 border-t border-line py-3">
                <Icon name={getNotificationIcon(notification.type)} className="text-neutral-700" />
                <div className="min-w-0 flex-1">
                  <div className={cn("text-[14px]", notification.unread ? "font-extrabold" : "font-medium")}>
                    {notification.title}
                  </div>
                  <div className="text-[12px] text-neutral-700">{notification.body}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
