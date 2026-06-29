import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { QrCode } from "lucide-react";

export default async function ScannerPage() {
  await requireRole(["super_admin", "platform_admin", "support_admin"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Scanner Portal Management"
        description="Manage active scanner portals and scanner code allocations"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Volunteer scanning keys and portal configs will be implemented in the next sprint."
        icon={QrCode}
      />
    </div>
  );
}
