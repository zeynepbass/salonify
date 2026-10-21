"use client";

import { useEffect } from "react";

export function useEscapeKey(onEscape, active = true) {
  useEffect(() => {
    if (!active || !onEscape) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onEscape();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEscape, active]);
}

export function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}
