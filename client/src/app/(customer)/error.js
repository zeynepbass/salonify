"use client";

import RouteError from "@/components/organisms/RouteError";

export default function Error({ reset }) {
  return <RouteError description="Sayfa şu anda yüklenemedi. Bağlantını kontrol edip tekrar dene." onRetry={reset} />;
}
