import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const config = {
  info: { icon: Info, cls: "border-info/25 bg-info/10 text-info" },
  success: { icon: CheckCircle2, cls: "border-success/25 bg-success/10 text-success" },
  warning: { icon: AlertTriangle, cls: "border-warning/30 bg-warning/15 text-warning" },
  error: { icon: XCircle, cls: "border-destructive/25 bg-destructive/10 text-destructive" },
};

export function Alert({ variant = "info", title, children, className }) {
  const { icon: Icon, cls } = config[variant] ?? config.info;
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border p-3.5 text-sm", cls, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn("text-foreground/80", title && "mt-0.5")}>{children}</div>}
      </div>
    </div>
  );
}
