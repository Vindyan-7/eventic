import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { History } from "lucide-react";

export default async function AuditlogsPage() {
  await requireRole(["super_admin", "platform_admin", "finance_admin", "moderator", "viewer"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Audit & Security Logs"
        description="Immutable record of all administrator console operations"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Audit logs query and export tools will be implemented in the next sprint."
        icon={History}
      />
    </div>
  );
}
