import StateMessage from "@/components/molecules/StateMessage";
import QueryState from "@/components/organisms/QueryState";
import SectionHeader from "@/features/customer/home/components/SectionHeader";
import SalonGrid, { SalonGridSkeleton } from "@/features/customer/salon/components/SalonGrid";

export default function SalonShowcase({ title, subtitle, query, emptyText = "Henüz gösterilecek kuaför yok.", actions, children }) {
  return (
    <section className="page-container mt-20">
      <SectionHeader title={title} subtitle={subtitle} className="mb-6">
        {actions}
      </SectionHeader>
      <QueryState
        query={query}
        errorTitle="Kuaförler yüklenemedi."
        loading={<SalonGridSkeleton count={4} />}
        isEmpty={(salons) => salons.length === 0}
        empty={<StateMessage icon="search" title={emptyText} />}
      >
        {(salons) => <SalonGrid salons={salons} />}
      </QueryState>
      {children}
    </section>
  );
}
