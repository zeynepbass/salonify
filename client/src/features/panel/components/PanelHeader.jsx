import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";

export default function PanelHeader({ title, subtitle, unreadCount, onNewAppointment }) {
  return (
    <header className="sticky top-0 z-20 flex min-h-[72px] flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-line bg-canvas px-[clamp(16px,3vw,32px)] py-3">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[24px]">{title}</h1>
        <div className="truncate text-[13px] text-neutral-700">{subtitle}</div>
      </div>
      <Button
        variant="plain"
        size="icon"
        href="/panel/bildirimler"
        aria-label={`Bildirimler, ${unreadCount} okunmamış`}
        className="relative"
      >
        <Icon name="bell" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 grid h-4 min-w-4 place-items-center bg-accent px-1 text-[10px] font-extrabold text-canvas">
            {unreadCount}
          </span>
        )}
      </Button>
      <Button variant="primary" size="md" className="gap-2.5" onClick={onNewAppointment}>
        <Icon name="plus" />
        <span className="max-sm:sr-only">Yeni Randevu</span>
      </Button>
    </header>
  );
}
