import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "@/lib/utils";

/**
 * Apple-style theme switch: a sliding knob that crossfades sun and moon.
 * Reads and writes the existing ThemeContext, so the preference keeps
 * persisting exactly as before.
 */
export function ThemeToggle({ className }) {
  const { activeTheme, toggleTheme } = useTheme();
  const dark = activeTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
      title={`Switch to ${dark ? "light" : "dark"} theme`}
      onClick={toggleTheme}
      className={cn(
        "group relative inline-flex h-8 w-[3.25rem] shrink-0 items-center rounded-full p-1",
        "bg-secondary shadow-[inset_0_0_0_1px_var(--color-hairline)]",
        "transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-6 place-items-center rounded-full bg-surface shadow-sm",
          "transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          dark ? "translate-x-[1.25rem]" : "translate-x-0",
        )}
      >
        <Sun
          className={cn(
            "absolute size-3.5 text-warning transition-all duration-200",
            dark ? "scale-50 opacity-0" : "scale-100 opacity-100",
          )}
        />
        <Moon
          className={cn(
            "absolute size-3.5 text-primary transition-all duration-200",
            dark ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        />
      </span>
    </button>
  );
}
