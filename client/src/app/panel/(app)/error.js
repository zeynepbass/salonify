"use client";

import RouteError from "@/components/organisms/RouteError";

export default function Error({ reset }) {
  return <RouteError description="Panel verileri şu anda yüklenemedi. Tekrar dene." onRetry={reset} />;
}
