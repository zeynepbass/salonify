"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";

export function QueryProvider({ children }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
