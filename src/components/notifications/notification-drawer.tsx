"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { Bell, X, CheckCheck, Inbox, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  markAllRead,
  clearAllRead,
} from "@/services/notification-service";
import { NotificationItem } from "./notification-item";
import { NotificationSkeleton } from "./notification-skeleton";
import type { NotificationRecord } from "@/services/notification-service";
import Link from "next/link";

// ─── Date section grouping ────────────────────────────────────────────────────

function getSection(dateStr: string): "unread" | "today" | "yesterday" | "earlier" {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date >= today) return "today";
  if (date >= yesterday) return "yesterday";
  return "earlier";
}

function groupNotifications(notifications: NotificationRecord[]) {
  const unread: NotificationRecord[] = [];
  const today: NotificationRecord[] = [];
  const yesterday: NotificationRecord[] = [];
  const earlier: NotificationRecord[] = [];

  for (const n of notifications) {
    if (!n.is_read) {
      unread.push(n);
    } else {
      const section = getSection(n.created_at);
      if (section === "today") today.push(n);
      else if (section === "yesterday") yesterday.push(n);
      else earlier.push(n);
    }
  }

  return { unread, today, yesterday, earlier };
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  if (!count) return null;
  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2 bg-muted/80 backdrop-blur-sm border-b">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">
        {count}
      </span>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Inbox className="h-8 w-8 text-primary/60" />
      </div>
      <div>
        <p className="font-extrabold text-base">You're all caught up! 🎉</p>
        <p className="text-muted-foreground text-sm mt-1">
          No new notifications. Check back later.
        </p>
      </div>
      <Button asChild variant="outline" size="sm" className="rounded-xl gap-2">
        <Link href="/events">
          Explore Events <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  initialNotifications: NotificationRecord[];
  initialCount: number;
  onCountChange: (count: number) => void;
}

export function NotificationDrawer({
  open,
  onClose,
  initialNotifications,
  initialCount,
  onCountChange,
}: NotificationDrawerProps) {
  const [notifications, setNotifications] =
    useState<NotificationRecord[]>(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialNotifications.length >= 20);
  const [pending, startTransition] = useTransition();
  const drawerRef = useRef<HTMLDivElement>(null);

  const grouped = groupNotifications(notifications);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── optimistic update helpers ──
  const handleUpdate = useCallback(
    (id: string, update: Partial<NotificationRecord>) => {
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, ...update } : n));
        const newUnread = updated.filter((n) => !n.is_read).length;
        onCountChange(newUnread);
        return updated;
      });
    },
    [onCountChange]
  );

  const handleRemove = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.id !== id);
        const newUnread = filtered.filter((n) => !n.is_read).length;
        onCountChange(newUnread);
        return filtered;
      });
    },
    [onCountChange]
  );

  // ── mark all read ──
  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      onCountChange(0);
    });
  };

  // ── clear read ──
  const handleClearRead = () => {
    startTransition(async () => {
      await clearAllRead();
      setNotifications((prev) => prev.filter((n) => !n.is_read));
    });
  };

  // ── load more ──
  const handleLoadMore = async () => {
    setLoading(true);
    const nextPage = page + 1;
    const { notifications: more, total } = await getNotifications({
      page: nextPage,
      limit: 20,
    });
    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newOnes = more.filter((n) => !existingIds.has(n.id));
      return [...prev, ...newOnes];
    });
    setPage(nextPage);
    setHasMore(notifications.length + more.length < total);
    setLoading(false);
  };

  // ── Keyboard: Escape to close ──
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Notifications"
        aria-modal="true"
        onKeyDown={handleKeyDown}
        className={cn(
          "fixed z-50 flex flex-col bg-background border shadow-2xl",
          // Desktop: right slide-in sheet
          "right-0 top-0 h-full w-full sm:max-w-sm",
          // Mobile: bottom sheet
          "sm:rounded-none rounded-t-3xl",
          "bottom-0 sm:top-0",
          "transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="font-extrabold text-base">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground gap-1 cursor-pointer"
                onClick={handleMarkAllRead}
                disabled={pending}
                aria-label="Mark all notifications as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </Button>
            )}
            {notifications.some((n) => n.is_read) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground gap-1 cursor-pointer"
                onClick={handleClearRead}
                disabled={pending}
                aria-label="Clear read notifications"
              >
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline">Clear read</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto" tabIndex={-1}>
          {notifications.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Unread section */}
              {grouped.unread.length > 0 && (
                <div>
                  <SectionHeader label="Unread" count={grouped.unread.length} />
                  {grouped.unread.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onUpdate={handleUpdate}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              )}

              {/* Today section */}
              {grouped.today.length > 0 && (
                <div>
                  <SectionHeader label="Today" count={grouped.today.length} />
                  {grouped.today.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onUpdate={handleUpdate}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              )}

              {/* Yesterday section */}
              {grouped.yesterday.length > 0 && (
                <div>
                  <SectionHeader label="Yesterday" count={grouped.yesterday.length} />
                  {grouped.yesterday.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onUpdate={handleUpdate}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              )}

              {/* Earlier section */}
              {grouped.earlier.length > 0 && (
                <div>
                  <SectionHeader label="Earlier" count={grouped.earlier.length} />
                  {grouped.earlier.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onUpdate={handleUpdate}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              )}

              {/* Load more */}
              {hasMore && (
                <div className="p-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-2"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                    ) : null}
                    {loading ? "Loading..." : "Load more"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-5 py-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full rounded-xl text-muted-foreground gap-2 text-xs"
          >
            <Link href="/dashboard/notifications" onClick={onClose}>
              View Notification Center
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
