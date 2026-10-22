import Spinner from "@/components/atoms/Spinner";
import { cn } from "@/lib/cn";

export default function PageSpinner({ label = "Yükleniyor", className = "min-h-[50vh]" }) {
  return (
    <div aria-busy="true" aria-label={label} className={cn("grid place-items-center text-neutral-600", className)}>
      <Spinner size={22} />
    </div>
  );
}
