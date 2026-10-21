"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useUpdateProfile(options = {}) {
  return useMutation({
    mutationFn: (body) => api.patch("/users/me", body),
    ...options,
  });
}

export function useChangePassword(options = {}) {
  return useMutation({
    mutationFn: (body) => api.patch("/users/me/password", body),
    ...options,
  });
}

export function useDeleteAccount(options = {}) {
  return useMutation({
    mutationFn: (password) => api.delete("/users/me", { data: { password } }),
    ...options,
  });
}
