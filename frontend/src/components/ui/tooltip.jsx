import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

/** Simple wrapper: <Tooltip label="Delete"><Button/></Tooltip> */
function Tooltip({ label, children, side = "top", delayDuration = 200 }) {
  if (!label) return children;
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            "z-50 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md",
            "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in",
          )}
        >
          {label}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export { Tooltip, TooltipProvider };
