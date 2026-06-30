import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/services/notification-service";
import { NotificationCenterClient } from "./notification-center-client";

export const metadata = {
  title: "Notifications — Eventic",
  description: "View and manage all your Eventic notifications.",
};

export default async function NotificationsPage() {
  await requireUser("/dashboard/notifications");
  const { notifications, total } = await getNotifications({ limit: 20 });

  return (
    <NotificationCenterClient
      initialNotifications={notifications}
      initialTotal={total}
    />
  );
}
