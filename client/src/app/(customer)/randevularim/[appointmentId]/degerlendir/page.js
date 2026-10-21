import ReviewFormPage from "@/features/customer/reviews/ReviewFormPage";

export const metadata = { title: "Değerlendirme" };

export default async function Page({ params }) {
  const { appointmentId } = await params;

  return <ReviewFormPage appointmentId={appointmentId} />;
}
