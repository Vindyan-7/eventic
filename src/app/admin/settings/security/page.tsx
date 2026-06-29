import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { Settings } from "lucide-react";

export default async function SettingsSecurityPage() {
  await requireRole(["super_admin", "platform_admin", "finance_admin"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Security Settings"
        description="Audit CORS configs, API keys, and RLS rules"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Secret values rotation and login restrictions will be implemented in the next sprint."
        icon={Settings}
      />
    </div>
  );
}
