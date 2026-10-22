"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo } from "react";
import { api } from "@/lib/api";
import { authKeys } from "@/lib/queryKeys";

const AuthContext = createContext(null);

const toSession = ({ user, salon = null }) => ({ user, salon });

async function restoreSession() {
  try {
    return toSession(await api.refreshSession());
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const { data: session, isPending } = useQuery({
    queryKey: authKeys.session,
    queryFn: restoreSession,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  const applySession = useCallback(
    (payload) => {
      if (payload.accessToken) api.setAccessToken(payload.accessToken);
      queryClient.setQueryData(authKeys.session, toSession(payload));
      return payload.user;
    },
    [queryClient],
  );

  const clearSession = useCallback(() => {
    api.setAccessToken(null);
    queryClient.setQueryData(authKeys.session, null);
  }, [queryClient]);

  const login = useCallback(
    async (credentials) => applySession(await api.post("/auth/login", credentials)),
    [applySession],
  );

  const register = useCallback(async (payload) => applySession(await api.post("/auth/register", payload)), [applySession]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const updateSession = useCallback(
    (changes) => queryClient.setQueryData(authKeys.session, (current) => (current ? { ...current, ...changes } : current)),
    [queryClient],
  );

  const value = useMemo(
    () => ({
      status: isPending ? "loading" : session?.user ? "authenticated" : "guest",
      user: session?.user ?? null,
      salon: session?.salon ?? null,
      login,
      register,
      logout,
      applySession,
      updateSession,
      clearSession,
    }),
    [isPending, session, login, register, logout, applySession, updateSession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth yalnızca AuthProvider içinde kullanılabilir.");
  return context;
}
