import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Paper-pressed-glass buttons.
 * Ink is the primary. Elevation is a hairline ring plus a whisper of shadow —
 * never a colored glow. Press is a real 1px settle, not a bounce.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "rounded-xl text-sm font-medium tracking-[-0.01em]",
    "transition-[background-color,color,box-shadow,transform,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
    "active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-110 active:brightness-95",
        secondary:
          "glass text-foreground hover:bg-accent/70",
        outline:
          "bg-transparent text-foreground shadow-[0_0_0_1px_var(--color-input)] hover:bg-accent",
        ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 hover:shadow-sm",
        success: "bg-success text-success-foreground shadow-xs hover:bg-success/90 hover:shadow-sm",
        link: "h-auto p-0 text-foreground underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 rounded-lg px-3 text-xs",
        default: "h-10 px-4",
        lg: "h-12 rounded-2xl px-6 text-[0.9375rem]",
        icon: "size-10",
        "icon-sm": "size-8 rounded-lg",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "default", size: "default", block: false },
  },
);

const Button = React.forwardRef(function Button(
  { className, variant, size, block, asChild = false, loading = false, children, disabled, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : props.type || "button"}
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
});

export { Button, buttonVariants };
