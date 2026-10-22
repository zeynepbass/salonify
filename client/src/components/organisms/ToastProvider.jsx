"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/atoms/Icon";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";

const ToastContext = createContext(null);

const DURATION = 3200;

export function ToastProvider({ className, children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, { tone = "success" } = {}) => {
    clearTimeout(timerRef.current);
    setToast({ message, tone });
    timerRef.current = setTimeout(() => setToast(null), DURATION);
  }, []);

  const showError = useCallback((error) => showToast(getErrorMessage(error), { tone: "error" }), [showToast]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const value = useMemo(() => ({ showToast, showError }), [showToast, showError]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" className={cn("pointer-events-none fixed z-95 max-w-[calc(100vw-32px)]", className)}>
        {toast && (
          <div className="flex animate-rise items-center gap-2.5 rounded-lg bg-neutral-900 px-[18px] py-3.5 text-[14px] text-canvas shadow-lg">
            <Icon name={toast.tone === "error" ? "alert" : "check"} className="text-accent-400" />
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast yalnızca ToastProvider içinde kullanılabilir.");
  return context;
}
