"use client";
import { useState } from "react";
import { ModeSwitcher } from "@/components/shared/mode-switcher";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signOut } from "@/services/auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ModeGuard } from "@/components/shared/mode-guard";
import { NotificationBell } from "./notification-bell";

interface HeaderProps {
    role: "user" | "org";
    profile: any;
    initialNotifications?: any[];
}

export function Header({ role, profile, initialNotifications = [] }: HeaderProps) {
    const isOrganizer = profile?.role === "org_admin";
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
            <ModeGuard isOrganizer={isOrganizer} />
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                    <Sidebar profile={profile} onNavigate={() => setOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="flex-1 flex items-center gap-4">
                <form className="hidden md:flex flex-1 max-w-sm relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search events, orders, or customers..."
                        className="w-full bg-muted/50 pl-8 md:w-[300px] lg:w-[400px] border-none"
                    />
                </form>
            </div>

            <div className="flex items-center gap-2">
                <ModeSwitcher isOrganizer={isOrganizer} />
                <ThemeToggle />
                <NotificationBell initialNotifications={initialNotifications} />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-8 w-8 rounded-full"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage
                                    src={
                                        profile?.avatar_url ??
                                        ""
                                    }
                                    alt={
                                        profile?.full_name ??
                                        "User"
                                    }
                                />

                                <AvatarFallback>
                                    {profile?.full_name
                                        ?.split(" ")
                                        .map(
                                            (
                                                part: string
                                            ) =>
                                                part[0]
                                        )
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase() ??
                                        "U"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-56"
                        align="end"
                        forceMount
                    >
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {profile?.full_name ??
                                        "User"}
                                </p>

                                <p className="text-xs leading-none text-muted-foreground">
                                    {profile?.email ??
                                        ""}
                                </p>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                            <a href="/dashboard/profile">
                                My Profile
                            </a>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <a href="/dashboard/events">
                                My Events
                            </a>
                        </DropdownMenuItem>

                        {isOrganizer && (
                            <>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                    <a href="/org/settings">
                                        Organization Settings
                                    </a>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <a href="/org/analytics">
                                        Analytics
                                    </a>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <a href="/org/payouts">
                                        Payouts
                                    </a>
                                </DropdownMenuItem>
                            </>

                        )}

                        <DropdownMenuSeparator />

                        <div className="px-2 py-1">
                            <form action={signOut}>
                                <button
                                    type="submit"
                                    className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                                >
                                    Logout
                                </button>
                            </form>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
