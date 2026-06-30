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
    Ticket,
    Users,
    ChevronDown,
    Heart,
    Clock
} from "lucide-react";

import { useAppModeStore } from "@/store/app-mode";
import { useWorkspace } from "@/app/(org)/org/workspace-context";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    profile: any;
    onNavigate?: () => void;
}

export function Sidebar({ profile, className, onNavigate }: SidebarProps) {
    const pathname = usePathname();
    const { mode } = useAppModeStore();

    const isOrganizer = profile?.role === "org_admin";
    const isVolunteer = profile?.role === "volunteer";

    // Extract event ID from pathname if present
    const eventIdMatch = pathname.match(/\/org\/events\/([^\/]+)/);
    const eventId = eventIdMatch ? eventIdMatch[1] : "";

    // Safely consume workspace context
    let workspaceCtx: any = null;
    if (mode === "organization" && isOrganizer) {
        try {
            workspaceCtx = useWorkspace();
        } catch (e) {
            // Ignore if out of provider context
        }
    }

    const handleWorkspaceChange = (id: string) => {
        document.cookie = `eventic_active_workspace=${id}; path=/; max-age=31536000`;
        localStorage.setItem("eventic_active_workspace", id);
        window.location.href = "/org";
    };

    // Filter dynamic sidebar menu items based on permissions
    const getOrganizerItems = () => {
        if (!workspaceCtx) return [];

        const { permissions, isOwner } = workspaceCtx;

        const allItems = [
            {
                label: "Workspace Dashboard",
                href: "/org",
                icon: LayoutDashboard,
                show: true,
            },
            {
                label: "Manage Events",
                href: "/org/events",
                icon: Calendar,
                show: true,
            },
            {
                label: "Create Event",
                href: "/org/events/create",
                icon: PlusCircle,
                show: isOwner || permissions?.events?.create === true,
            },
            {
                label: "Analytics",
                href: "/org/analytics",
                icon: BarChart3,
                show: isOwner || permissions?.analytics?.view === true,
            },
            {
                label: "Payouts",
                href: "/org/payouts",
                icon: Wallet,
                show: isOwner || permissions?.finance?.payouts === true,
            },
            {
                label: "Workspace Members",
                href: "/org/settings/members",
                icon: Users,
                show: isOwner || permissions?.workspace?.members === true,
            },
            {
                label: "Volunteers Monitor",
                href: "/org/volunteers",
                icon: Users,
                show: isOwner || permissions?.workspace?.members === true,
            },

            {
                label: "Settings",
                href: "/org/settings",
                icon: Settings,
                show: isOwner || permissions?.workspace?.settings === true,
            },
        ];

        return allItems.filter(item => item.show);
    };

    const items = isVolunteer
        ? (eventId
            ? [
                {
                    label: "Scan Tickets",
                    href: `/org/events/${eventId}/scan`,
                    icon: Search,
                },
                {
                    label: "Attendees List",
                    href: `/org/events/${eventId}/attendees`,
                    icon: User,
                },
            ]
            : [
                {
                    label: "Scanner Portal",
                    href: `/login/scan`,
                    icon: Search,
                }
            ]
          )
        : mode === "organization" && isOrganizer
            ? getOrganizerItems()
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
                    label: "Following",
                    href: "/dashboard/following",
                    icon: Heart,
                },
                {
                    label: "My Waitlists",
                    href: "/dashboard/waitlist",
                    icon: Clock,
                },
                {
                    label: "Profile",
                    href: "/dashboard/profile",
                    icon: User,
                },
                ...(isOrganizer
                    ? [
                        {
                            label: "Organization Mode",
                            href: "/org",
                            icon: LayoutDashboard,
                        },
                    ]
                    : [
                        {
                            label: "Become Organizer",
                            href: "/org/create",
                            icon: PlusCircle,
                        },
                    ]),
            ];

    return (
        <div className={cn("pb-12 h-full flex flex-col font-sans", className)}>
            <div className="p-6 mb-2 border-b border-neutral-900/60">
                <Link href="/" className="flex items-center gap-2" onClick={() => onNavigate?.()}>
                    <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center">
                        <span className="font-extrabold text-lg">E</span>
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-white">Eventic</span>
                </Link>

                {/* Workspace Switcher Selector */}
                {workspaceCtx && workspaceCtx.activeWorkspaces?.length > 0 && (
                    <div className="mt-5 relative">
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1.5">Workspace</span>
                        <div className="relative">
                            <select
                                value={workspaceCtx.workspace.id}
                                onChange={(e) => handleWorkspaceChange(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-900 text-xs font-bold text-white py-2 pl-3 pr-8 rounded-xl appearance-none cursor-pointer outline-none focus:border-neutral-800"
                            >
                                {workspaceCtx.activeWorkspaces.map((w: any) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name} {w.is_owner ? "(Owner)" : ""}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="h-4.5 w-4.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                )}
            </div>

            <ScrollArea className="flex-1 pr-3 pl-1 pt-4">
                <div className="space-y-1.5">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => onNavigate?.()}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 border-l-2 hover:bg-neutral-900/40",
                                    isActive 
                                        ? "bg-neutral-900 text-white font-extrabold border-white rounded-r-xl" 
                                        : "text-neutral-500 hover:text-white border-transparent"
                                )}
                            >
                                <Icon className="h-4.5 w-4.5 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </ScrollArea>

            <div className="mt-auto px-6 py-4 border-t border-neutral-900">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-extrabold">
                    Pro Plan
                </p>
                <p className="text-xs text-neutral-450 mt-1">
                    Active until July 2026
                </p>
            </div>
        </div>
    );
}
