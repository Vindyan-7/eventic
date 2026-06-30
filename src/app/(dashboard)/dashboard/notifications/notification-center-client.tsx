"use client";

import { useState, useTransition, useCallback } from "react";
import {
  Bell, Search, Filter, CheckCheck, Archive, Trash2,
  RefreshCw, Inbox, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationItem } from "@/components/notifications/notification-item";
import { NotificationSkeleton } from "@/components/notifications/notification-skeleton";
import {
  getNotifications,
  markAllRead,
  clearAllRead,
} from "@/services/notification-service";
import type { NotificationRecord, NotificationCategory } from "@/services/notification-service";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CATEGORIES: { label: string; value: NotificationCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Events", value: "Events" },
  { label: "Tickets", value: "Tickets" },
  { label: "Waitlist", value: "Waitlist" },
  { label: "Workspace", value: "Workspace" },
  { label: "Volunteer", value: "Volunteer" },
  { label: "Certificates", value: "Certificates" },
  { label: "Platform", value: "Platform" },
];

const READ_FILTERS = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
  { label: "Archived", value: "archived" },
];

interface NotificationCenterClientProps {
  initialNotifications: NotificationRecord[];
  initialTotal: number;
}

export function NotificationCenterClient({
  initialNotifications,
  initialTotal,
}: NotificationCenterClientProps) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>(initialNotifications);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<NotificationCategory | "all">("all");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read" | "archived">("all");

  const unreadCount = notifications.filter((n) => !n.is_read && !n.is_archived).length;

  // ── optimistic handlers ──
  const handleUpdate = useCallback((id: string, update: Partial<NotificationRecord>) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, ...update } : n)));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  // ── filter and search ──
  const applyFilters = async (
    newSearch = search,
    newCategory = category,
    newReadFilter = readFilter,
    newPage = 1
  ) => {
    setLoading(true);
    const opts: Parameters<typeof getNotifications>[0] = {
      page: newPage,
      limit: 20,
      search: newSearch || undefined,
      category: newCategory !== "all" ? newCategory : undefined,
      isRead:
        newReadFilter === "unread"
          ? false
          : newReadFilter === "read"
          ? true
          : undefined,
      isArchived: newReadFilter === "archived",
    };

    const { notifications: data, total: t } = await getNotifications(opts);
    if (newPage === 1) {
      setNotifications(data);
    } else {
      setNotifications((prev) => [...prev, ...data]);
    }
    setTotal(t);
    setPage(newPage);
    setLoading(false);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(search, category, readFilter, 1);
  };

  const handleCategoryChange = (cat: NotificationCategory | "all") => {
    setCategory(cat);
    applyFilters(search, cat, readFilter, 1);
  };

  const handleReadFilterChange = (filter: "all" | "unread" | "read" | "archived") => {
    setReadFilter(filter);
    applyFilters(search, category, filter, 1);
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    });
  };

  const handleClearRead = () => {
    startTransition(async () => {
      await clearAllRead();
      setNotifications((prev) => prev.filter((n) => !n.is_read));
    });
  };

  const handleLoadMore = async () => {
    await applyFilters(search, category, readFilter, page + 1);
  };

  const hasMore = notifications.length < total;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-7 w-7 text-primary" />
            Notifications
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"} · {total} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5 text-xs font-bold cursor-pointer"
              onClick={handleMarkAllRead}
              disabled={pending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 text-xs font-bold cursor-pointer"
            onClick={handleClearRead}
            disabled={pending}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Clear read
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-xl gap-1.5 text-xs text-muted-foreground"
          >
            <Link href="/dashboard/notifications/preferences">Preferences</Link>
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search notifications…"
            className="pl-9 rounded-xl bg-muted/50 border-none h-10"
            aria-label="Search notifications"
          />
        </form>

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                category === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              aria-pressed={category === cat.value}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Read / Archived filter */}
        <div className="flex gap-1.5">
          {READ_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleReadFilterChange(f.value as any)}
              className={cn(
                "px-3 py-1 rounded-full text-[11px] font-bold transition-all border",
                readFilter === f.value
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-muted-foreground/30 hover:border-muted-foreground/60"
              )}
              aria-pressed={readFilter === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="rounded-3xl border overflow-hidden bg-background">
        {loading && notifications.length === 0 ? (
          <NotificationSkeleton count={5} />
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Inbox className="h-8 w-8 text-primary/60" />
            </div>
            <div>
              <p className="font-extrabold text-base">You're all caught up! 🎉</p>
              <p className="text-muted-foreground text-sm mt-1">
                {search || category !== "all" || readFilter !== "all"
                  ? "No notifications match your filters."
                  : "No notifications yet. Check back later."}
              </p>
            </div>
          </div>
        ) : (
          <>
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
              />
            ))}

            {hasMore && (
              <div className="p-4 text-center border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-2"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading && (
                    <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  <ChevronDown className="h-3.5 w-3.5" />
                  Load more ({total - notifications.length} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
