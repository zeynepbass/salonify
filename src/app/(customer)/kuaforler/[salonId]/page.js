import { notFound } from "next/navigation";
import { salons } from "@/data/mock/salons";
import SalonDetailPage from "@/features/salon/SalonDetailPage";
import { getSalon } from "@/lib/catalog";

export function generateStaticParams() {
  return salons.map((salon) => ({ salonId: String(salon.id) }));
}

export async function generateMetadata({ params }) {
  const { salonId } = await params;
  const salon = getSalon(salonId);
  return salon ? { title: salon.name, description: salon.description } : {};
}

export default async function Page({ params }) {
  const { salonId } = await params;
  const salon = getSalon(salonId);

  if (!salon) notFound();

  return <SalonDetailPage salon={salon} />;
}
