"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const POLL_INTERVAL = 30_000; // 30 seconds

/**
 * Polls /api/notifications/count every 30s when the window is focused.
 * Stops polling when the tab is hidden to conserve resources.
 */
export function useNotificationCount(initialCount: number) {
  const [count, setCount] = useState(initialCount);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const fetchCount = useCallback(async () => {
    if (!isMountedRef.current) return;
    try {
      const res = await fetch("/api/notifications/count", {
        cache: "no-store",
        headers: { "x-source": "notification-poll" },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (isMountedRef.current && typeof json.count === "number") {
        setCount(json.count);
      }
    } catch {
      // Network error — silently ignore, will retry next interval
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const startPolling = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(fetchCount, POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCount(); // Fetch immediately on tab focus
        startPolling();
      } else {
        stopPolling();
      }
    };

    // Start polling if tab is already visible
    if (document.visibilityState === "visible") {
      startPolling();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchCount]);

  return [count, setCount] as const;
}
