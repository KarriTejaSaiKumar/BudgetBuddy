import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext(null);

function Tabs({ value, defaultValue, onValueChange, className, children, ...props }) {
  const [internal, setInternal] = React.useState(defaultValue);
  const active = value !== undefined ? value : internal;
  const setActive = (v) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn("space-y-4", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex items-center gap-1 rounded-lg bg-muted p-1", className)}
      {...props}
    />
  );
}

function TabsTrigger({ value, className, ...props }) {
  const ctx = React.useContext(TabsContext);
  const selected = ctx?.active === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={() => ctx?.setActive(value)}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "bg-surface text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ value, className, ...props }) {
  const ctx = React.useContext(TabsContext);
  if (ctx?.active !== value) return null;
  return <div role="tabpanel" className={cn("outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
