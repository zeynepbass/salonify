import { cn } from "@/lib/cn";

export default function ImagePlaceholder({ src, alt = "", stripe = 14, tone = "light", className, imageClassName }) {
  const dark = tone === "dark";

  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-neutral-200", className)}>
        <img src={src} alt={alt} loading="lazy" className={cn("absolute inset-0 size-full object-cover transition-transform duration-500", imageClassName)} />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className={cn("stripes absolute inset-0", imageClassName)}
        style={{
          "--stripe": `${stripe}px`,
          ...(dark && { "--stripe-a": "var(--color-neutral-500)", "--stripe-b": "var(--color-neutral-600)" }),
        }}
      />
    </div>
  );
}
