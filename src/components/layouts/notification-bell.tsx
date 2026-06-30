"use client";

import { useTransition, useState, useEffect } from "react";
import { Bell, CheckCheck, Ticket, Clock, AlertCircle, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { markNotificationRead, markAllNotificationsRead } from "@/services/notifications";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    created_at: string;
    event_id: string | null;
}

interface NotificationBellProps {
    initialNotifications: Notification[];
}

const TYPE_ICONS: Record<string, React.ElementType> = {
    WAITLIST_JOINED: Clock,
    SEAT_RESERVED: Ticket,
    RESERVATION_EXPIRING: AlertCircle,
    RESERVATION_EXPIRED: AlertCircle,
    TICKET_CLAIMED: CalendarCheck,
};

const TYPE_COLORS: Record<string, string> = {
    WAITLIST_JOINED: "text-yellow-500",
    SEAT_RESERVED: "text-green-500",
    RESERVATION_EXPIRING: "text-orange-500",
    RESERVATION_EXPIRED: "text-neutral-500",
    TICKET_CLAIMED: "text-blue-500",
};

export function NotificationBell({ initialNotifications }: NotificationBellProps) {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [pending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkRead = (id: string) => {
        startTransition(async () => {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        });
    };

    const handleMarkAll = () => {
        startTransition(async () => {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        });
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[9px] font-extrabold flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <h3 className="font-extrabold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground gap-1 cursor-pointer"
                            onClick={handleMarkAll}
                            disabled={pending}
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No notifications yet.</p>
                        </div>
                    ) : (
                        <ul>
                            {notifications.map((notification) => {
                                const Icon = TYPE_ICONS[notification.type] || Bell;
                                const iconColor = TYPE_COLORS[notification.type] || "text-muted-foreground";
                                return (
                                    <li
                                        key={notification.id}
                                        onClick={() => !notification.read && handleMarkRead(notification.id)}
                                        className={cn(
                                            "flex items-start gap-3 p-4 border-b last:border-0 transition-colors cursor-default",
                                            !notification.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"
                                        )}
                                    >
                                        <div className={cn("mt-0.5 shrink-0", iconColor)}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("text-xs font-bold", !notification.read ? "text-foreground" : "text-muted-foreground")}>
                                                {notification.title}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground/60 mt-1">
                                                {new Date(notification.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
