"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, refreshSession, setAccessToken } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState({ status: "loading", user: null, salon: null });

  const applySession = useCallback(({ accessToken, user, salon = null }) => {
    if (accessToken) setAccessToken(accessToken);
    setSession({ status: "authenticated", user, salon });
    return user;
  }, []);

  useEffect(() => {
    refreshSession()
      .then(applySession)
      .catch(() => setSession({ status: "guest", user: null, salon: null }));
  }, [applySession]);

  const login = useCallback(
    async (credentials) => applySession(await api.post("/auth/login", credentials)),
    [applySession],
  );

  const register = useCallback(async (payload) => applySession(await api.post("/auth/register", payload)), [applySession]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setSession({ status: "guest", user: null, salon: null });
    }
  }, []);

  const updateSession = useCallback((changes) => setSession((current) => ({ ...current, ...changes })), []);

  const value = useMemo(
    () => ({ ...session, login, register, logout, applySession, updateSession }),
    [session, login, register, logout, applySession, updateSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth yalnızca AuthProvider içinde kullanılabilir.");
  return context;
}
