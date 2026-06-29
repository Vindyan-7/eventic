import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { Settings } from "lucide-react";

export default async function SettingsGeneralPage() {
  await requireRole(["super_admin", "platform_admin", "finance_admin"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="General Settings"
        description="Configure platform defaults, brand names, and meta settings"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="System defaults and landing parameters will be implemented in the next sprint."
        icon={Settings}
      />
    </div>
  );
}
