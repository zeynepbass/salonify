import AppointmentsScreen from "@/features/customer/screens/AppointmentsScreen";

export const metadata = { title: "Randevular" };

const TABS = { bugun: "today", yaklasan: "upcoming", gecmis: "past", tumu: "all" };

export default async function Page({ searchParams }) {
  const { sekme } = await searchParams;

  return <AppointmentsScreen initialTab={TABS[sekme] ?? "today"} />;
}
