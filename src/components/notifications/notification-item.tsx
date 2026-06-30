"use client";

import { useTransition } from "react";
import {
  Bell, Ticket, Clock, AlertCircle, CalendarCheck, UserPlus,
  Award, RefreshCw, Ban, Users, Megaphone, Building2, XCircle,
  CheckCircle, HandHeart, UserCheck, Archive, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { markRead, archiveNotification, deleteNotification } from "@/services/notification-service";
import type { NotificationRecord } from "@/services/notification-templates";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ─── Icon registry ────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Bell,
  Ticket,
  Clock,
  AlertCircle,
  CalendarCheck,
  UserPlus,
  Award,
  RefreshCw,
  Ban,
  Users,
  Megaphone,
  Building2,
  XCircle,
  CheckCircle,
  HandHeart,
  UserCheck,
};

// ─── Relative time ────────────────────────────────────────────────────────────

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── Category badge color ─────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<string, string> = {
  Events: "bg-blue-500/10 text-blue-500",
  Tickets: "bg-green-500/10 text-green-500",
  Workspace: "bg-purple-500/10 text-purple-500",
  Volunteer: "bg-pink-500/10 text-pink-500",
  Certificates: "bg-indigo-500/10 text-indigo-500",
  Waitlist: "bg-yellow-500/10 text-yellow-500",
  Platform: "bg-neutral-500/10 text-neutral-400",
  Admin: "bg-red-500/10 text-red-500",
};

const PRIORITY_STYLES: Record<string, string> = {
  critical: "border-l-2 border-red-500",
  high: "border-l-2 border-orange-500",
  normal: "",
  low: "opacity-80",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: NotificationRecord;
  onUpdate: (id: string, update: Partial<NotificationRecord>) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onUpdate,
  onRemove,
  compact = false,
}: NotificationItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const Icon = ICON_MAP[notification.icon ?? ""] ?? Bell;
  const categoryStyle = CATEGORY_STYLES[notification.category] ?? CATEGORY_STYLES.Platform;
  const priorityStyle = PRIORITY_STYLES[notification.priority] ?? "";

  const handleClick = () => {
    if (!notification.is_read) {
      startTransition(async () => {
        await markRead(notification.id);
        onUpdate(notification.id, { is_read: true });
      });
    }
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await archiveNotification(notification.id);
      onRemove(notification.id);
      toast.success("Notification archived");
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await deleteNotification(notification.id);
      onRemove(notification.id);
      toast.success("Notification deleted");
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${notification.is_read ? "" : "Unread: "}${notification.title}`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className={cn(
        "group flex items-start gap-3 p-4 border-b last:border-0 transition-all cursor-pointer relative",
        priorityStyle,
        !notification.is_read
          ? "bg-primary/5 hover:bg-primary/8"
          : "hover:bg-muted/40",
        compact ? "py-3" : "py-4"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          notification.color
            ? `bg-current/10`
            : "bg-muted"
        )}
      >
        <Icon
          className={cn("h-4 w-4", notification.color ?? "text-muted-foreground")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-xs leading-snug",
              !notification.is_read ? "font-bold text-foreground" : "font-medium text-muted-foreground"
            )}
          >
            {notification.title}
          </p>
          <span className="text-[9px] text-muted-foreground/60 shrink-0 mt-0.5">
            {getRelativeTime(notification.created_at)}
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          {notification.message}
        </p>

        {!compact && (
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                categoryStyle
              )}
            >
              {notification.category}
            </span>
            {notification.priority === "high" && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500">
                High
              </span>
            )}
            {notification.priority === "critical" && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500">
                Critical
              </span>
            )}
          </div>
        )}
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0 animate-pulse" />
      )}

      {/* Hover actions */}
      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-background/90 backdrop-blur-sm border rounded-lg p-1 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          title="Archive"
          disabled={pending}
          onClick={handleArchive}
          aria-label="Archive notification"
        >
          <Archive className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          title="Delete"
          disabled={pending}
          onClick={handleDelete}
          aria-label="Delete notification"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
