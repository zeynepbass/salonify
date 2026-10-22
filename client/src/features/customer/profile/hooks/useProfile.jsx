"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/customer/auth/AuthProvider";
import { removePrivateQueries } from "@/features/customer/auth/hooks/useAuth";
import { api } from "@/lib/api";
import { userKeys } from "@/lib/queryKeys";

const REVIEW_LIMIT = 50;

export function useMyReviews() {
  return useQuery({
    queryKey: userKeys.reviews(),
    queryFn: () => api.get("/users/me/reviews", { params: { limit: REVIEW_LIMIT } }),
    select: (data) => data.items,
  });
}

export function useUpdateProfile(options = {}) {
  const { updateSession } = useAuth();

  return useMutation({
    mutationFn: (body) => api.patch("/users/me", body),
    ...options,
    onSuccess: (profile, ...rest) => {
      updateSession({ user: profile.user });
      options.onSuccess?.(profile, ...rest);
    },
  });
}

export function useChangePassword(options = {}) {
  const { applySession } = useAuth();

  return useMutation({
    mutationFn: (body) => api.patch("/users/me/password", body),
    ...options,
    onSuccess: (session, ...rest) => {
      applySession(session);
      options.onSuccess?.(session, ...rest);
    },
  });
}

export function useDeleteAccount(options = {}) {
  const { clearSession } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password) => api.delete("/users/me", { data: { password } }),
    ...options,
    onSuccess: (...args) => {
      clearSession();
      removePrivateQueries(queryClient);
      options.onSuccess?.(...args);
    },
  });
}
