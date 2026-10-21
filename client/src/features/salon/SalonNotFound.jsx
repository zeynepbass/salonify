import Button from "@/components/atoms/Button";
import StateMessage from "@/components/molecules/StateMessage";

export default function SalonNotFound({ description = "Aradığın kuaför kaldırılmış ya da bağlantı hatalı olabilir." }) {
  return (
    <div className="page-container max-w-[760px] pt-10">
      <StateMessage icon="search" title="Kuaför bulunamadı." description={description}>
        <Button variant="primary" href="/kuaforler">
          Kuaförlere dön
        </Button>
      </StateMessage>
    </div>
  );
}
