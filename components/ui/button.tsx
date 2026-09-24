import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "inverse" | "glass" | "link";
export type ButtonSize = "sm" | "md" | "lg";

/*
 * "Premium Calm" button (docs/spec/02-design-direction.md): pill shapes,
 * near-black primary, hairline light secondary, brand-blue accent.
 */
const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium select-none transition-[background-color,box-shadow,color,opacity] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-fg text-white hover:bg-[#262b36]",
  secondary: "bg-white text-fg shadow-[inset_0_0_0_1px_#dcdde2] hover:shadow-[inset_0_0_0_1px_#b9bcc4]",
  outline: "bg-white text-fg shadow-[inset_0_0_0_1px_#dcdde2] hover:shadow-[inset_0_0_0_1px_#b9bcc4]",
  ghost: "text-fg-2 hover:bg-soft hover:text-fg",
  danger: "bg-[#d92d20] text-white hover:bg-[#b42318]",
  inverse: "bg-white text-fg hover:bg-white/90",
  glass: "bg-brand text-white hover:bg-[#0058e0]",
  link: "text-brand underline-offset-4 hover:underline px-0! h-auto! rounded-none",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13.5px]",
  md: "h-11 px-5 text-[14.5px]",
  lg: "h-12 px-6 text-[15px]",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string): string {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
}

export function Button({ variant = "primary", size = "md", loading, loadingText, icon, className, children, disabled, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? <Spinner className="size-4" /> : icon}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export function ButtonLink({ variant = "primary", size = "md", icon, iconRight, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
