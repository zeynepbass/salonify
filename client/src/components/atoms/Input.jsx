import { cn } from "@/lib/cn";

const CONTROL =
  "w-full min-h-10 border border-line bg-canvas px-3 py-2 text-[14px] text-ink transition-colors hover:border-neutral-500 focus:border-ink disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500 disabled:hover:border-line aria-invalid:border-accent-700";

export function Input({ className, ...props }) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn(CONTROL, "resize-y leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(CONTROL, "appearance-auto", className)} {...props}>
      {children}
    </select>
  );
}
