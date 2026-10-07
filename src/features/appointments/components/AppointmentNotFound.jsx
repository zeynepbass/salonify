import Button from "@/components/atoms/Button";
import StateMessage from "@/components/molecules/StateMessage";

export default function AppointmentNotFound() {
  return (
    <div className="page-container max-w-[760px] pt-10">
      <StateMessage
        icon="calendar"
        title="Randevu bulunamadı."
        description="Aradığın randevu silinmiş ya da bağlantı hatalı olabilir."
      >
        <Button variant="primary" href="/randevularim">
          Randevularıma dön
        </Button>
      </StateMessage>
    </div>
  );
}
