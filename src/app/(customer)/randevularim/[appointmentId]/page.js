import AppointmentDetailPage from "@/features/appointments/AppointmentDetailPage";

export const metadata = { title: "Randevu detayı" };

export default async function Page({ params }) {
  const { appointmentId } = await params;

  return <AppointmentDetailPage appointmentId={appointmentId} />;
}
