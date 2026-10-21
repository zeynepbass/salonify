"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/customer/auth/AuthProvider";

export function useLogin(options = {}) {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (credentials) => login(credentials),
    ...options,
  });
}

export function useRegister(options = {}) {
  const { register } = useAuth();

  return useMutation({
    mutationFn: (payload) => register(payload),
    ...options,
  });
}

export function useLogout(options = {}) {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    ...options,
    onSettled: (...args) => {
      queryClient.clear();
      options.onSettled?.(...args);
    },
  });
}
