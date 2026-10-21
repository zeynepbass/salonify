import BookingPage from "@/features/customer/booking/BookingPage";

export const metadata = { title: "Randevu al" };

export default async function Page({ params, searchParams }) {
  const { salonId } = await params;
  const { hizmet } = await searchParams;

  return <BookingPage salonId={salonId} initialServiceId={hizmet} />;
}
