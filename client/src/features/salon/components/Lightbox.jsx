"use client";

import { useCallback, useEffect, useRef } from "react";
import Icon from "@/components/atoms/Icon";
import ImagePlaceholder from "@/components/atoms/ImagePlaceholder";
import StarRating from "@/components/atoms/StarRating";
import { useBodyScrollLock } from "@/lib/hooks";

const SWIPE_THRESHOLD = 40;

const CONTROL = "grid flex-none place-items-center border border-canvas/40 text-canvas transition-colors hover:border-canvas hover:bg-canvas/10";

export default function Lightbox({ items, index, onChange, onClose }) {
  const touchStartX = useRef(null);
  const closeButtonRef = useRef(null);
  const item = items[index];

  useBodyScrollLock();

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  const step = useCallback(
    (delta) => onChange((index + delta + items.length) % items.length),
    [index, items.length, onChange],
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, onClose]);

  const handleTouchEnd = (event) => {
    const distance = event.changedTouches[0].clientX - (touchStartX.current ?? 0);
    if (Math.abs(distance) > SWIPE_THRESHOLD) step(distance < 0 ? 1 : -1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Portföy görüntüleyici"
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-90 flex flex-col bg-neutral-900/[0.96] text-canvas"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-[13px] tracking-[0.06em]">
          {index + 1} / {items.length}
        </span>
        <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Kapat (Esc)" className={`${CONTROL} size-11`}>
          <Icon name="close" size={22} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center gap-4 px-4">
        <button type="button" onClick={() => step(-1)} aria-label="Önceki fotoğraf" className={`${CONTROL} size-[52px] max-sm:hidden`}>
          <Icon name="chevronLeft" size={26} />
        </button>
        <ImagePlaceholder
          key={item.id}
          src={item.image}
          alt={item.title}
          label="saç fotoğrafı · tam boyut"
          tone="dark"
          stripe={16}
          className="aspect-[4/5] h-[min(72vh,760px)] max-w-full animate-rise sm:max-w-[calc(100vw-168px)]"
        />
        <button type="button" onClick={() => step(1)} aria-label="Sonraki fotoğraf" className={`${CONTROL} size-[52px] max-sm:hidden`}>
          <Icon name="chevronRight" size={26} />
        </button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-canvas/25 p-5">
        <div>
          <div className="text-[20px] font-extrabold">{item.title}</div>
          <div className="text-[14px] opacity-80">{item.subtitle}</div>
        </div>
        {item.rating && <StarRating value={item.rating} size={18} tone="dark" />}
        <div className="text-[12px] opacity-70 max-sm:hidden">← → gezin · Esc kapat</div>
        <div className="flex gap-2 sm:hidden">
          <button type="button" onClick={() => step(-1)} aria-label="Önceki fotoğraf" className={`${CONTROL} size-11`}>
            <Icon name="chevronLeft" size={22} />
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Sonraki fotoğraf" className={`${CONTROL} size-11`}>
            <Icon name="chevronRight" size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
