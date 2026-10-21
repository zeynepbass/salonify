import BookingSuccessPage from "@/features/customer/booking/BookingSuccessPage";

export const metadata = { title: "Randevunuz oluşturuldu" };

export default async function Page({ params }) {
  const { appointmentId } = await params;

  return <BookingSuccessPage appointmentId={appointmentId} />;
}
