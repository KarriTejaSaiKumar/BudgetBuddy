import { cn } from "@/lib/utils";

/**
 * Page title block: quiet eyebrow above a confident title.
 * No icon chip — hierarchy comes from type, not decoration.
 */
export function PageHeader({ title, description, eyebrow, actions, className }) {
  return (
    <header
      className={cn("flex flex-wrap items-end justify-between gap-4", className)}
    >
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="truncate text-2xl font-medium tracking-tight text-balance text-foreground sm:text-[1.75rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionHeader({ title, description, action, className }) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="truncate text-sm font-medium tracking-tight text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
