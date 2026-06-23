"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Search,
    Calendar,
    User,
    PlusCircle,
    LayoutDashboard,
    BarChart3,
    Wallet,
    Settings,
    Ticket
} from "lucide-react";

import { useAppModeStore } from "@/store/app-mode";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    profile: any;
}

export function Sidebar({ profile, className }: SidebarProps) {
    const pathname = usePathname();
    const { mode } = useAppModeStore();

    const isOrganizer = profile?.role === "org_admin";

    const items =
        mode === "organization" &&
            isOrganizer
            ? [
                {
                    label:
                        "Organization Dashboard",
                    href: "/org",
                    icon: LayoutDashboard,
                },
                {
                    label: "Manage Events",
                    href: "/org/events",
                    icon: Calendar,
                },
                {
                    label: "Create Event",
                    href: "/org/events/create",
                    icon: PlusCircle,
                },
                {
                    label: "Analytics",
                    href: "/org/analytics",
                    icon: BarChart3,
                },
                {
                    label: "Payouts",
                    href: "/org/payouts",
                    icon: Wallet,
                },
                {
                    label: "Settings",
                    href: "/org/settings",
                    icon: Settings,
                },
            ]
            : [
                {
                    label: "Discover Events",
                    href: "/events",
                    icon: Search,
                },
                {
                    label: "My Events",
                    href: "/dashboard/events",
                    icon: Calendar,
                },
                {
                    label: "My Tickets",
                    href: "/dashboard/tickets",
                    icon: Ticket,
                },
                {
                    label: "Profile",
                    href: "/dashboard/profile",
                    icon: User,
                },
                ...(isOrganizer
                    ? [
                        {
                            label:
                                "Organization Mode",
                            href: "/org",
                            icon: LayoutDashboard,
                        },
                    ]
                    : [
                        {
                            label:
                                "Become Organizer",
                            href: "/org/create",
                            icon: PlusCircle,
                        },
                    ]),
            ];


    return (
        <div className={cn("pb-12 h-full flex flex-col", className)}>
            <div className="p-6 mb-2">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg">E</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">Eventic</span>
                </Link>
            </div>

            <ScrollArea className="flex-1 px-3">
                <div className="space-y-1">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </ScrollArea>

            <div className="mt-auto px-6 py-4 border-t">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Pro Plan
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Active until July 2026
                </p>
            </div>
        </div>
    );
}


