"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/features/shared/auth/AuthProvider";
import { api } from "@/lib/api";
import { authKeys } from "@/lib/queryKeys";

export function removePrivateQueries(queryClient) {
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== authKeys.session[0] });
}

export function leaveTo(path) {
  window.location.replace(path);
}

function useSessionMutation(request, options) {
  const { applySession } = useAuth();

  return useMutation({
    mutationFn: async (body) => applySession(await request(body)),
    ...options,
  });
}

export function useLogin(options = {}) {
  return useSessionMutation((credentials) => api.post("/auth/login", credentials), options);
}

export function useRegister(options = {}) {
  return useSessionMutation((payload) => api.post("/auth/register", payload), options);
}

export function useLogout({ redirectTo } = {}) {
  const { clearSession } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSettled: () => {
      if (redirectTo) return leaveTo(redirectTo);
      clearSession();
      removePrivateQueries(queryClient);
    },
  });
}

export function useRoleGuardedAuth(role, wrongRoleMessage) {
  const [roleError, setRoleError] = useState(null);
  const logout = useLogout();

  const rejectWrongRole = (user) => {
    if (user.role === role) return;
    logout.mutate();
    setRoleError(wrongRoleMessage);
  };

  const login = useLogin({ onSuccess: rejectWrongRole });
  const register = useRegister({ onSuccess: rejectWrongRole });

  const reset = () => {
    setRoleError(null);
    login.reset();
    register.reset();
  };

  return { login, register, roleError, reset };
}
