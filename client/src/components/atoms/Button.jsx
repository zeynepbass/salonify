import Link from "next/link";
import { cn } from "@/lib/cn";

const VARIANTS = {
  primary:
    "border-accent bg-accent text-canvas shadow-[0_8px_20px_-10px_rgb(201_40_62/0.7)] not-disabled:hover:-translate-y-px not-disabled:hover:border-accent-600 not-disabled:hover:bg-accent-600",
  secondary: "border-line bg-canvas text-ink not-disabled:hover:border-neutral-500 not-disabled:hover:bg-neutral-100",
  ghost: "border-transparent bg-transparent text-accent-700 not-disabled:hover:bg-neutral-200",
  plain: "border-transparent bg-transparent text-ink not-disabled:hover:bg-neutral-200",
  danger: "border-accent-400 bg-transparent text-accent-700 not-disabled:hover:bg-accent-100",
};

const SIZES = {
  sm: "min-h-9 px-3 py-2 text-[14px]",
  md: "min-h-[42px] px-4 py-2.5 text-[14px]",
  lg: "min-h-[50px] px-[18px] text-[16px]",
  xl: "min-h-14 px-5 text-[17px]",
  icon: "size-9 p-0 rounded-full",
};

const ALIGNMENTS = {
  center: "justify-center",
  start: "justify-start",
  between: "justify-between",
};

export default function Button({
  variant = "secondary",
  size = "sm",
  align = "center",
  href,
  type = "button",
  className,
  children,
  ...props
}) {
  const classes = cn(
    "inline-flex items-center gap-2 rounded-md border font-semibold no-underline transition-[color,background-color,border-color,transform,box-shadow] duration-150 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45",
    VARIANTS[variant],
    SIZES[size],
    ALIGNMENTS[align],
    className,
  );

  if (href) {
    const Component = /^(tel:|mailto:|https?:)/.test(href) ? "a" : Link;
    return (
      <Component href={href} className={classes} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
