import { Suspense } from "react";
import { SalonGridSkeleton } from "@/features/salon/components/SalonGrid";
import SearchPage from "@/features/search/SearchPage";

export const metadata = { title: "Kuaförler" };

function Fallback() {
  return (
    <div className="page-container pt-7">
      <SalonGridSkeleton density="compact" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Fallback />}>
      <SearchPage />
    </Suspense>
  );
}
