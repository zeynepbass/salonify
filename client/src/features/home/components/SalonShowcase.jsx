import SectionHeader from "@/features/home/components/SectionHeader";
import SalonGrid from "@/features/salon/components/SalonGrid";

export default function SalonShowcase({ title, subtitle, salons, actions, children }) {
  return (
    <section className="page-container mt-16">
      <SectionHeader title={title} subtitle={subtitle} className="mb-6">
        {actions}
      </SectionHeader>
      <SalonGrid salons={salons} />
      {children}
    </section>
  );
}
