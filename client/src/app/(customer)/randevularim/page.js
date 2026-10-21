import AppointmentsPage from "@/features/customer/appointments/AppointmentsPage";

export const metadata = { title: "Randevularım" };

export default async function Page({ searchParams }) {
  const { sekme } = await searchParams;

  return <AppointmentsPage initialTab={sekme === "gecmis" ? "past" : "upcoming"} />;
}
