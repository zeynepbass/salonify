import StateMessage from "@/components/molecules/StateMessage";
import SectionHeader from "@/features/home/components/SectionHeader";
import SalonGrid, { SalonGridSkeleton } from "@/features/salon/components/SalonGrid";

export default function SalonShowcase({ title, subtitle, salons, emptyText = "Henüz gösterilecek kuaför yok.", actions, children }) {
  return (
    <section className="page-container mt-16">
      <SectionHeader title={title} subtitle={subtitle} className="mb-6">
        {actions}
      </SectionHeader>
      {salons === null ? (
        <SalonGridSkeleton count={4} />
      ) : salons.length === 0 ? (
        <StateMessage icon="search" title={emptyText} />
      ) : (
        <SalonGrid salons={salons} />
      )}
      {children}
    </section>
  );
}
