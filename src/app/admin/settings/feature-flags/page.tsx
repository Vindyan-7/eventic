import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { Settings } from "lucide-react";

export default async function SettingsFeatureflagsPage() {
  await requireRole(["super_admin", "platform_admin", "finance_admin"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Feature Flags"
        description="Toggle experimental features and beta testing tools"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Feature toggles and targeted rollouts will be implemented in the next sprint."
        icon={Settings}
      />
    </div>
  );
}
