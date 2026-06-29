import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { Calendar } from "lucide-react";

export default async function EventsPage() {
  await requireRole(["super_admin", "platform_admin", "moderator", "viewer"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Events Moderation"
        description="Monitor, review, and moderate published public fests and events"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Events verification list and moderation details will be implemented in the next sprint."
        icon={Calendar}
      />
    </div>
  );
}
