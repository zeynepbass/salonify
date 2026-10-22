import { QueryClient, isServer } from "@tanstack/react-query";

const STALE_TIME = 30 * 1000;
const MAX_RETRIES = 1;

function shouldRetry(failureCount, error) {
  const status = error?.response?.status;
  if (status && status >= 400 && status < 500) return false;
  return failureCount < MAX_RETRIES;
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_TIME, retry: shouldRetry, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}

let browserQueryClient = null;

export function getQueryClient() {
  if (isServer) return createQueryClient();
  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}
