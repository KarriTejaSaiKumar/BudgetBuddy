import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(function Input({ className, type = "text", invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-11 w-full rounded-xl border border-input bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-[background-color,border-color,box-shadow] duration-200",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/25",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
});

const Textarea = React.forwardRef(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex min-h-24 w-full rounded-xl border border-input bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-[background-color,border-color,box-shadow] duration-200",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/25",
        className,
      )}
      {...props}
    />
  );
});

/** Native select styled to match Input — no extra dependency, fully accessible. */
const Select = React.forwardRef(function Select({ className, children, invalid, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-11 w-full appearance-none rounded-xl border border-input bg-surface px-3 py-2 pr-9 text-sm text-foreground shadow-xs transition-[background-color,border-color,box-shadow] duration-200 cursor-pointer",
        "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_0.65rem_center] bg-no-repeat",
        "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/25",
        "[&_option]:bg-surface [&_option]:text-foreground dark:[&_option]:bg-surface dark:[&_option]:text-foreground",
        "[&_option:checked]:bg-accent [&_option:checked]:text-accent-foreground",
        "[&_option:disabled]:text-muted-foreground",
        "[&_optgroup]:bg-surface [&_optgroup]:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export { Input, Textarea, Select };
