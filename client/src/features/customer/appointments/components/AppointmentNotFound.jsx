import Button from "@/components/atoms/Button";
import StateMessage from "@/components/molecules/StateMessage";

export default function AppointmentNotFound({ description = "Aradığın randevu silinmiş ya da bağlantı hatalı olabilir." }) {
  return (
    <div className="page-container max-w-[760px] pt-10">
      <StateMessage
        icon="calendar"
        title="Randevu bulunamadı."
        description={description}
      >
        <Button variant="primary" href="/randevularim">
          Randevularıma dön
        </Button>
      </StateMessage>
    </div>
  );
}
