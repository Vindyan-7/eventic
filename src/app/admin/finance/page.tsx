import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { DollarSign } from "lucide-react";

export default async function FinancePage() {
  await requireRole(["super_admin", "platform_admin", "finance_admin"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Financial Operations"
        description="Track platform revenue, invoices, and organizer payouts"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Transactions ledger and bank payout approvals will be implemented in the next sprint."
        icon={DollarSign}
      />
    </div>
  );
}
