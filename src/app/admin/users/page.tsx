import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { Users } from "lucide-react";

export default async function UsersPage() {
  await requireRole(["super_admin", "platform_admin", "support_admin", "moderator", "viewer"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="User Management"
        description="Manage registered user profiles and access permissions"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Users listing and moderation controls will be implemented in the next sprint."
        icon={Users}
      />
    </div>
  );
}
