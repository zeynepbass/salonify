import { cn } from "@/lib/cn";

export function HeadCell({ className, children }) {
  return (
    <th scope="col" className={cn("eyebrow border-b border-neutral-400 px-3 py-2.5 text-left text-neutral-700", className)}>
      {children}
    </th>
  );
}

export function Cell({ as: Component = "td", className, children, ...props }) {
  return (
    <Component className={cn("border-b border-line px-3 py-3", className)} {...props}>
      {children}
    </Component>
  );
}
