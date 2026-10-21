import { cn } from "@/lib/cn";

export default function ImagePlaceholder({ src, alt = "", label, stripe = 14, tone = "light", className, imageClassName }) {
  const dark = tone === "dark";

  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-neutral-200", className)}>
        <img src={src} alt={alt} loading="lazy" className={cn("absolute inset-0 size-full object-cover grayscale", imageClassName)} />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className={cn("stripes absolute inset-0 grayscale", imageClassName)}
        style={{
          "--stripe": `${stripe}px`,
          ...(dark && { "--stripe-a": "var(--color-neutral-500)", "--stripe-b": "var(--color-neutral-600)" }),
        }}
      />
      {label && (
        <span
          className={cn(
            "absolute bottom-2 left-2.5 font-mono text-[10px]",
            dark ? "text-neutral-200" : "text-neutral-700",
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
