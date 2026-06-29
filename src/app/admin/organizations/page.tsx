import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { Building } from "lucide-react";

export default async function OrganizationsPage() {
  await requireRole(["super_admin", "platform_admin", "moderator", "viewer"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Organizations Management"
        description="Review and manage host organizations and verification states"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Organizations list and verification operations will be implemented in the next sprint."
        icon={Building}
      />
    </div>
  );
}
