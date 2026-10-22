"use client";

import PageSpinner from "@/components/molecules/PageSpinner";
import { useSalon } from "@/features/customer/salon/hooks/useSalon";
import SalonNotFound from "@/features/customer/salon/SalonNotFound";
import { getErrorMessage, isNotFound } from "@/lib/api";

export default function SalonGate({ salonId, children }) {
  const { data: salon, isPending, error } = useSalon(salonId);

  if (isPending) return <PageSpinner label="Kuaför yükleniyor" />;
  if (!salon) return <SalonNotFound description={isNotFound(error) ? undefined : getErrorMessage(error)} />;
  return children(salon);
}
