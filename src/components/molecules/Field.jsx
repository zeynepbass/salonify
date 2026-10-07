import { cn } from "@/lib/cn";

export default function Field({ label, htmlFor, hint, error, className, children }) {
  const Label = htmlFor ? "label" : "span";

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-[13px] font-semibold">
        {label}
        {hint && <span className="font-normal text-neutral-600"> · {hint}</span>}
      </Label>
      {children}
      {error && <p className="text-[12px] text-accent-700">{error}</p>}
    </div>
  );
}
