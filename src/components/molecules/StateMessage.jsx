import Icon from "@/components/atoms/Icon";
import { cn } from "@/lib/cn";

export default function StateMessage({ icon, tone = "muted", title, description, role, className, children }) {
  return (
    <div role={role} className={cn("flex flex-col items-start gap-3 border-2 border-line px-7 py-10 sm:px-8 sm:py-12", className)}>
      {icon && <Icon name={icon} size={28} className={tone === "accent" ? "text-accent" : "text-neutral-600"} />}
      <h3 className="text-[20px]">{title}</h3>
      {description && <p className="max-w-[48ch] text-neutral-700">{description}</p>}
      {children}
    </div>
  );
}
