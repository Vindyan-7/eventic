import * as React from "react";
import { cn } from "@/lib/utils";

// =========================================
// ADMIN COMPONENTS LIBRARY
// =========================================

// AdminCard
export function AdminCard({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 shadow-sm backdrop-blur transition-all duration-200 hover:border-neutral-700/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// AdminStatsCard
export function AdminStatsCard({
  title,
  value,
  description,
  icon: Icon,
  className
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<any>;
  className?: string;
}) {
  return (
    <AdminCard className={className}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{title}</span>
        {Icon && <Icon className="h-5 w-5 text-neutral-500" />}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-white">{value}</span>
      </div>
      {description && (
        <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{description}</p>
      )}
    </AdminCard>
  );
}

// AdminTable
export function AdminTable({
  headers,
  children,
  className
}: {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/30", className)}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-900/60 text-neutral-400 font-medium">
            {headers.map((h, idx) => (
              <th key={idx} className="p-4 font-bold text-xs uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/60">
          {children}
        </tbody>
      </table>
    </div>
  );
}

// AdminBadge
export function AdminBadge({
  role,
  className
}: {
  role: string;
  className?: string;
}) {
  const getBadgeColors = (r: string) => {
    switch (r.toLowerCase()) {
      case "super_admin":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "platform_admin":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "finance_admin":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "moderator":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "support_admin":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "viewer":
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider",
        getBadgeColors(role),
        className
      )}
    >
      {role.replace("_", " ")}
    </span>
  );
}

// AdminHeader
export function AdminHeader({
  title,
  description,
  actions,
  className
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80 mb-8", className)}>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-neutral-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

// AdminEmptyState
export function AdminEmptyState({
  title,
  description,
  icon: Icon,
  action,
  className
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<any>;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-12 border border-dashed border-neutral-800 rounded-3xl bg-neutral-900/10", className)}>
      {Icon && <Icon className="h-10 w-10 text-neutral-600 mb-4" />}
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-neutral-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}

// AdminSection
export function AdminSection({
  title,
  children,
  className
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      {title && (
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800/60 pb-2">{title}</h2>
      )}
      <div>{children}</div>
    </section>
  );
}
