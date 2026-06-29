import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { ShieldAlert } from "lucide-react";

export default async function UnauthorizedPage() {
  await requireAdmin();

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Unauthorized Access"
        description="403 - Forbidden"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="You do not have the required role permissions to access this admin module."
        icon={ShieldAlert}
      />
    </div>
  );
}
