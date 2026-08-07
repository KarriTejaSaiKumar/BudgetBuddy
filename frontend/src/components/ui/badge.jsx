import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Quiet category chips. Tinted fills, no loud borders. */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-medium tracking-[0.01em] transition-colors [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        outline: "text-muted-foreground shadow-[0_0_0_1px_var(--color-input)]",
        primary: "bg-primary-soft text-foreground",
        success: "bg-success/10 text-success",
        destructive: "bg-destructive/10 text-destructive",
        warning: "bg-warning/12 text-warning",
        info: "bg-info/10 text-info",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant, icon: Icon, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
