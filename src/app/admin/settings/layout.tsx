"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  Paintbrush,
  Mail,
  Shield,
  Flag,
  Webhook,
  Key,
  Database,
  Activity,
  Heart,
  Sliders
} from "lucide-react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { label: "General", href: "/admin/settings/general", icon: Settings },
    { label: "Branding", href: "/admin/settings/branding", icon: Paintbrush },
    { label: "Email & Templates", href: "/admin/settings/email", icon: Mail },
    { label: "Security Policies", href: "/admin/settings/security", icon: Shield },
    { label: "Feature Flags", href: "/admin/settings/features", icon: Flag },
    { label: "Outgoing Webhooks", href: "/admin/settings/webhooks", icon: Webhook },
    { label: "API Credentials", href: "/admin/settings/api", icon: Key },
    { label: "Integrations Portal", href: "/admin/settings/integrations", icon: Sliders },
    { label: "Maintenance Modes", href: "/admin/settings/maintenance", icon: Activity },
    { label: "Backup Records", href: "/admin/settings/backups", icon: Database },
    { label: "Health Dashboard", href: "/admin/settings/health", icon: Heart }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 font-sans pb-16">
      {/* Settings Navigation Sidebar */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-4 space-y-1">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider px-3 mb-2 block">Settings Console</span>
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href === "/admin/settings/features" && pathname === "/admin/settings/feature-flags");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white text-black"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Settings Page View */}
      <main className="flex-1 min-w-0">
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
