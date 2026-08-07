import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

/**
 * Accessible form field wrapper: label + control + hint/error, wired with
 * htmlFor / aria-describedby / aria-invalid automatically.
 */
export function Field({ id, label, hint, error, required, className, children }) {
  const reactId = React.useId();
  const fieldId = id || reactId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const control = React.isValidElement(children)
    ? React.cloneElement(children, {
        id: fieldId,
        required,
        invalid: Boolean(error) || undefined,
        "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
      })
    : children;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}
      {control}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
