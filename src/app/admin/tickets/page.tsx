import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { Ticket } from "lucide-react";

export default async function TicketsPage() {
  await requireRole(["super_admin", "platform_admin", "support_admin"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Tickets & Purchases"
        description="Query registered tickets, scan analytics, and checkout operations"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Global ticket registry and lookup tools will be implemented in the next sprint."
        icon={Ticket}
      />
    </div>
  );
}
