import SalonCard, { SalonCardSkeleton } from "@/features/customer/salon/components/SalonCard";
import { cn } from "@/lib/cn";

const DENSITIES = {
  comfortable: "grid-cols-[repeat(auto-fill,minmax(min(270px,100%),1fr))]",
  compact: "grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))]",
};

export default function SalonGrid({ salons, density = "comfortable" }) {
  return (
    <div className={cn("grid gap-6", DENSITIES[density])}>
      {salons.map((salon) => (
        <SalonCard key={salon.id} salon={salon} />
      ))}
    </div>
  );
}

export function SalonGridSkeleton({ count = 6, density = "comfortable" }) {
  return (
    <div aria-busy="true" aria-label="Sonuçlar yükleniyor" className={cn("grid gap-6", DENSITIES[density])}>
      {Array.from({ length: count }, (_, index) => (
        <SalonCardSkeleton key={index} />
      ))}
    </div>
  );
}
