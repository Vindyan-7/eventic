"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationDrawer } from "@/components/notifications/notification-drawer";
import { useNotificationCount } from "@/hooks/use-notification-count";
import type { NotificationRecord } from "@/services/notification-templates";

interface NotificationBellProps {
  initialNotifications: NotificationRecord[];
  initialCount?: number;
}

export function NotificationBell({
  initialNotifications,
  initialCount,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useNotificationCount(
    initialCount ?? initialNotifications.filter((n) => !n.is_read).length
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[16px] h-4 bg-primary text-primary-foreground rounded-full text-[9px] font-extrabold flex items-center justify-center px-1 leading-none"
            aria-hidden="true"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>

      <NotificationDrawer
        open={open}
        onClose={() => setOpen(false)}
        initialNotifications={initialNotifications}
        initialCount={count}
        onCountChange={setCount}
      />
    </>
  );
}
