import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { ShieldAlert } from "lucide-react";

export default async function ModerationPage() {
  await requireRole(["super_admin", "platform_admin", "moderator"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Moderation Controls"
        description="Review reported content and flag policy violations"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Reported listings and safety queues will be implemented in the next sprint."
        icon={ShieldAlert}
      />
    </div>
  );
}
