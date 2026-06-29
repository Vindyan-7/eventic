import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  await requireRole(["super_admin", "platform_admin", "support_admin"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="System Announcements"
        description="Broadcast emails, system-wide alerts, and SMS updates"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Email campaign designer and push configurations will be implemented in the next sprint."
        icon={Bell}
      />
    </div>
  );
}
