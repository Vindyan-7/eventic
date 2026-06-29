import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { Settings } from "lucide-react";

export default async function SettingsRolesPage() {
  await requireRole(["super_admin", "platform_admin", "finance_admin"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Roles & Permissions"
        description="Configure administrative role parameters and bounds"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Permissions assignment table will be implemented in the next sprint."
        icon={Settings}
      />
    </div>
  );
}
