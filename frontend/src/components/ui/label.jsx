import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef(function Label({ className, required, children, ...props }, ref) {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-destructive" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
});

export { Label };
