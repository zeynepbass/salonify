import Icon from "@/components/atoms/Icon";
import { cn } from "@/lib/cn";

const TYPE_ICONS = {
  booked: "calendarCheck",
  updated: "refresh",
  review: "star",
  completed: "checkCircle",
  cancelled: "closeCircle",
  reminder: "clock",
};

export default function NotificationList({ notifications, onSelect }) {
  return (
    <ul className="border-t-2 border-ink">
      {notifications.map((notification) => (
        <li key={notification.id}>
          <button
            type="button"
            onClick={() => onSelect(notification)}
            className={cn(
              "flex w-full items-start gap-4 border-b border-line px-4 py-[18px] text-left transition-colors hover:bg-neutral-200",
              notification.unread && "bg-surface",
            )}
          >
            <span className="grid size-10 flex-none place-items-center border border-line bg-canvas">
              <Icon name={TYPE_ICONS[notification.type]} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className={cn("text-[15px]", notification.unread ? "font-extrabold" : "font-medium")}>
                {notification.title}
              </span>
              <span className="text-[13px] text-neutral-700">{notification.body}</span>
            </span>
            <span className="flex flex-none flex-col items-end gap-1.5">
              <span className="text-[12px] text-neutral-700">{notification.time}</span>
              {notification.unread && (
                <span className="flex items-center gap-1 text-[10px] font-extrabold tracking-[0.08em] text-accent-700">
                  <span className="size-2 bg-accent" />
                  YENİ
                </span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function getNotificationIcon(type) {
  return TYPE_ICONS[type];
}
