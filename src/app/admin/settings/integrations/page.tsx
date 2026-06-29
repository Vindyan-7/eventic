import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { Settings } from "lucide-react";

export default async function SettingsIntegrationsPage() {
  await requireRole(["super_admin", "platform_admin", "finance_admin"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Integrations & APIs"
        description="Configure Razorpay, Supabase, and SMTP email drivers"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Credentials sync will be implemented in the next sprint."
        icon={Settings}
      />
    </div>
  );
}
