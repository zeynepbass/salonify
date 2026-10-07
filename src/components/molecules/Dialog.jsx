"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { useBodyScrollLock, useEscapeKey } from "@/lib/hooks";

const SIZES = {
  sm: "max-w-[440px]",
  md: "max-w-[560px]",
};

export default function Dialog({
  as: Component = "div",
  role = "dialog",
  size = "sm",
  titleId,
  onClose,
  className,
  children,
  ...props
}) {
  const panelRef = useRef(null);

  useEscapeKey(onClose);
  useBodyScrollLock();

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-80 grid place-items-center bg-neutral-900/50 p-4"
      onMouseDown={handleBackdropMouseDown}
    >
      <Component
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "flex max-h-[92vh] w-full animate-rise flex-col gap-4 overflow-auto bg-canvas p-6 shadow-lg outline-none",
          SIZES[size],
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    </div>
  );
}

export function DialogTitle({ id, children }) {
  return (
    <h2 id={id} className="text-[22px] text-balance">
      {children}
    </h2>
  );
}

export function DialogBody({ id, children }) {
  return (
    <div id={id} className="text-[14px] leading-relaxed text-neutral-800">
      {children}
    </div>
  );
}

export function DialogActions({ className, children }) {
  return <div className={cn("flex flex-wrap justify-end gap-2", className)}>{children}</div>;
}
