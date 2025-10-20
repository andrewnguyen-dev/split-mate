"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, children, ...props }, ref) {
    return (
      <label
        className={cn(
          "inline-flex items-center gap-2 text-sm text-foreground",
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className="peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-input bg-background transition-colors checked:bg-primary checked:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          {...props}
        />
        <span className="select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-60">
          {children}
        </span>
      </label>
    );
  }
);
