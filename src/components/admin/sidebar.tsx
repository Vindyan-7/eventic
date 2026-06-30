"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminRole } from "@/lib/admin/auth";
import {
  LayoutDashboard,
  Users,
  Building,
  Calendar,
  Ticket,
  QrCode,
  DollarSign,
  BarChart3,
  ShieldAlert,
  FileText,
  Bell,
  History,
  Settings,
  ShieldCheck,
  AlertTriangle,
  Megaphone,
  Flag,
  Star,
  Settings2
} from "lucide-react";

interface SidebarProps {
  role: AdminRole;
  onNavigate?: () => void;
  className?: string;
}

interface SidebarItem {
  label: string;
  href: string;
  icon: any;
  allowedRoles: AdminRole[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    allowedRoles: ["super_admin", "platform_admin", "support_admin", "finance_admin", "moderator", "viewer"]
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    allowedRoles: ["super_admin", "platform_admin", "support_admin", "moderator", "viewer"]
  },
  {
    label: "User Moderation",
    href: "/admin/moderation/users",
    icon: AlertTriangle,
    allowedRoles: ["super_admin", "platform_admin", "moderator"]
  },
  {
    label: "Organizations",
    href: "/admin/organizations",
    icon: Building,
    allowedRoles: ["super_admin", "platform_admin", "moderator", "viewer"]
  },
  {
    label: "Verifications",
    href: "/admin/organizations/verification",
    icon: ShieldCheck,
    allowedRoles: ["super_admin", "platform_admin", "moderator"]
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: Calendar,
    allowedRoles: ["super_admin", "platform_admin", "moderator", "viewer"]
  },
  {
    label: "Event Moderation",
    href: "/admin/moderation/events",
    icon: ShieldAlert,
    allowedRoles: ["super_admin", "platform_admin", "moderator"]
  },
  {
    label: "Abuse Reports",
    href: "/admin/reports",
    icon: Flag,
    allowedRoles: ["super_admin", "platform_admin", "moderator"]
  },
  {
    label: "Featured Events",
    href: "/admin/featured-events",
    icon: Star,
    allowedRoles: ["super_admin", "platform_admin", "moderator"]
  },
  {
    label: "Announcements",
    href: "/admin/announcements",
    icon: Megaphone,
    allowedRoles: ["super_admin", "platform_admin", "moderator"]
  },
  {
    label: "Platform Banners",
    href: "/admin/platform-banners",
    icon: Bell,
    allowedRoles: ["super_admin", "platform_admin", "moderator"]
  },
  {
    label: "Tickets",
    href: "/admin/tickets",
    icon: Ticket,
    allowedRoles: ["super_admin", "platform_admin", "support_admin"]
  },
  {
    label: "Scanner Portal",
    href: "/admin/scanner",
    icon: QrCode,
    allowedRoles: ["super_admin", "platform_admin", "support_admin"]
  },
  {
    label: "Finance",
    href: "/admin/finance",
    icon: DollarSign,
    allowedRoles: ["super_admin", "platform_admin", "finance_admin"]
  },
  {
    label: "Analytics Summary",
    href: "/admin/analytics",
    icon: BarChart3,
    allowedRoles: ["super_admin", "platform_admin", "finance_admin", "viewer"]
  },
  {
    label: "User Insights",
    href: "/admin/analytics/users",
    icon: Users,
    allowedRoles: ["super_admin", "platform_admin", "finance_admin", "viewer"]
  },
  {
    label: "Host Insights",
    href: "/admin/analytics/organizations",
    icon: Building,
    allowedRoles: ["super_admin", "platform_admin", "finance_admin", "viewer"]
  },
  {
    label: "Scanner Insights",
    href: "/admin/analytics/scanners",
    icon: QrCode,
    allowedRoles: ["super_admin", "platform_admin", "finance_admin", "viewer"]
  },
  {
    label: "CMS Editor",
    href: "/admin/cms",
    icon: FileText,
    allowedRoles: ["super_admin"]
  },
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: History,
    allowedRoles: ["super_admin", "platform_admin", "finance_admin", "moderator", "viewer"]
  },
  {
    label: "Admins Console",
    href: "/admin/admins",
    icon: ShieldCheck,
    allowedRoles: ["super_admin", "platform_admin"]
  },
  {
    label: "Maintenance Mode",
    href: "/admin/settings/maintenance",
    icon: Settings2,
    allowedRoles: ["super_admin"]
  },
  {
    label: "Settings",
    href: "/admin/settings/general",
    icon: Settings,
    allowedRoles: ["super_admin", "platform_admin", "finance_admin"]
  }
];

export function AdminSidebar({ role, onNavigate, className }: SidebarProps) {
  const pathname = usePathname();

  // Filter items based on user role
  const visibleItems = sidebarItems.filter(item => 
    role === "super_admin" || item.allowedRoles.includes(role)
  );

  return (
    <div className={cn("flex flex-col h-full bg-neutral-950 border-r border-neutral-900", className)}>
      <div className="p-6 border-b border-neutral-900">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={() => onNavigate?.()}>
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-extrabold text-lg">E</span>
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white block">Eventic</span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block leading-none">Console</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 border-l-2 hover:bg-neutral-900 hover:text-white",
                isActive
                  ? "bg-neutral-900 text-white border-white"
                  : "text-neutral-400 border-transparent hover:border-neutral-800"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-900 bg-neutral-950/50 text-[10px] text-neutral-500 text-center font-bold tracking-wider uppercase">
        SVCE College Project
      </div>
    </div>
  );
}
