import { notFound } from "next/navigation";
import BookingPage from "@/features/booking/BookingPage";
import { getSalon } from "@/lib/catalog";
import { services } from "@/data/mock/services";

export async function generateMetadata({ params }) {
  const { salonId } = await params;
  const salon = getSalon(salonId);
  return salon ? { title: `Randevu al · ${salon.name}` } : {};
}

export default async function Page({ params, searchParams }) {
  const { salonId } = await params;
  const { hizmet } = await searchParams;
  const salon = getSalon(salonId);

  if (!salon) notFound();

  const initialService = services.find((service) => service.id === hizmet && service.active);

  return <BookingPage salon={salon} initialServiceId={initialService?.id} />;
}
