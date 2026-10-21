import SalonDetailPage from "@/features/customer/salon/SalonDetailPage";

export const metadata = { title: "Kuaför" };

export default async function Page({ params }) {
  const { salonId } = await params;

  return <SalonDetailPage salonId={salonId} />;
}
