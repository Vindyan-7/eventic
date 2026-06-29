import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { BarChart3 } from "lucide-react";

export default async function AnalyticsPage() {
  await requireRole(["super_admin", "platform_admin", "finance_admin", "viewer"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Platform Analytics"
        description="Monitor event registrations, user growth, and check-in rates"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Historical charts and registration summaries will be implemented in the next sprint."
        icon={BarChart3}
      />
    </div>
  );
}
