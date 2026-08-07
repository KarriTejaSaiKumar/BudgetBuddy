import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The signature surface: a sheet of paper pressed under glass.
 * Depth comes from a hairline ring, not a border + drop shadow.
 */
const Card = React.forwardRef(function Card({ className, interactive = false, inset = false, as: Tag = "div", ...props }, ref) {
  return (
    <Tag
      ref={ref}
      className={cn(
        "rounded-2xl bg-card text-card-foreground shadow-[0_0_0_1px_var(--color-hairline),var(--shadow-sm)]",
        inset && "bg-transparent shadow-none",
        interactive &&
          "transition-[box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--color-border),var(--shadow-md)]",
        className,
      )}
      {...props}
    />
  );
});

const CardHeader = React.forwardRef(function CardHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cn("flex flex-col gap-1.5 p-6 sm:p-7", className)} {...props} />;
});

const CardTitle = React.forwardRef(function CardTitle({ className, as: Tag = "h3", ...props }, ref) {
  return <Tag ref={ref} className={cn("text-base font-medium tracking-tight", className)} {...props} />;
});

const CardDescription = React.forwardRef(function CardDescription({ className, ...props }, ref) {
  return <p ref={ref} className={cn("text-sm leading-relaxed text-muted-foreground", className)} {...props} />;
});

const CardContent = React.forwardRef(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn("p-6 pt-0 sm:p-7 sm:pt-0", className)} {...props} />;
});

const CardFooter = React.forwardRef(function CardFooter({ className, ...props }, ref) {
  return (
    <div ref={ref} className={cn("flex items-center gap-3 p-6 pt-0 sm:p-7 sm:pt-0", className)} {...props} />
  );
});

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
