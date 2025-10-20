import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "outline" | "soft";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeClasses: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  outline: "border border-border text-foreground",
  soft: "bg-accent text-accent-foreground",
};

export function Badge({
  className,
  variant = "soft",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide",
        badgeClasses[variant],
        className
      )}
      {...props}
    />
  );
}
