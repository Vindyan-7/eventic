import { requireAdmin } from "@/lib/admin/auth";
import {
  AdminHeader,
  AdminStatsCard,
  AdminCard,
  AdminTable,
  AdminBadge
} from "@/components/admin/ui";
import {
  Users,
  Building,
  Calendar,
  DollarSign,
  Ticket,
  CreditCard,
  AlertTriangle
} from "lucide-react";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  // Mock stats representing platform statistics
  const stats = [
    { title: "Total Users", value: "1,240", description: "+12% this month", icon: Users },
    { title: "Organizations", value: "85", description: "+4 new hosts", icon: Building },
    { title: "Active Events", value: "340", description: "+18 this week", icon: Calendar },
    { title: "Revenue", value: "₹1,45,200", description: "All-time ticket sales", icon: DollarSign },
    { title: "Tickets Sold", value: "2,840", description: "85% check-in rate", icon: Ticket },
    { title: "Pending Payouts", value: "₹24,800", description: "3 requests waiting", icon: CreditCard },
    { title: "Open Reports", value: "2", description: "Requires moderator review", icon: AlertTriangle }
  ];

  // Mock audit logs
  const mockAuditLogs = [
    { id: "1", action: "APPROVE_ORGANIZATION", entity: "Organization", entity_id: "org-1", admin: "super_admin@eventic.local", time: "2 mins ago" },
    { id: "2", action: "DELETE_EVENT", entity: "Event", entity_id: "event-4", admin: "moderator@eventic.local", time: "15 mins ago" },
    { id: "3", action: "REJECT_PAYOUT", entity: "Payout", entity_id: "payout-9", admin: "finance@eventic.local", time: "1 hour ago" },
    { id: "4", action: "RESET_PASSWORD", entity: "User", entity_id: "user-23", admin: "support@eventic.local", time: "3 hours ago" }
  ];

  return (
    <div className="space-y-8 font-sans">
      <AdminHeader
        title="Eventic Admin Console"
        description={`Welcome back, ${admin.full_name || admin.email}. Access level: ${admin.role}`}
      />

      {/* Grid of Stats */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, idx) => (
          <AdminStatsCard
            key={idx}
            title={s.title}
            value={s.value}
            description={s.description}
            icon={s.icon}
          />
        ))}
      </div>

      {/* Two columns for tables & info */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Recent Platform Operations</h2>
          <AdminTable headers={["Action", "Entity", "Target ID", "Executor", "Timestamp"]}>
            {mockAuditLogs.map((log) => (
              <tr key={log.id} className="text-neutral-300 hover:bg-neutral-900/40">
                <td className="p-4 font-mono text-xs text-white">{log.action}</td>
                <td className="p-4">{log.entity}</td>
                <td className="p-4 font-mono text-xs text-neutral-400">{log.entity_id}</td>
                <td className="p-4 text-neutral-400">{log.admin}</td>
                <td className="p-4 text-xs text-neutral-500">{log.time}</td>
              </tr>
            ))}
          </AdminTable>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">System Information</h2>
          <AdminCard className="space-y-4">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">PostgreSQL Database</span>
              <p className="text-sm font-bold text-white mt-1">Supabase Managed (owtlaecm...)</p>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">App Environment</span>
              <p className="text-sm font-bold text-white mt-1">Next.js v16 (Development)</p>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Admin Privileges</span>
              <div className="mt-1.5">
                <AdminBadge role={admin.role} />
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
