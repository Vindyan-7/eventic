"use client";

import { useState } from "react";
import {
  AdminHeader,
  AdminTable
} from "@/components/admin/ui";
import { exportToCSV } from "@/lib/admin/export";
import { toast } from "sonner";
import {
  History,
  Download,
  Filter,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditRecord {
  id: string;
  action: string;
  entity: string;
  entity_id: string;
  metadata: any;
  ip_address: string;
  created_at: string;
  admin_name: string;
  admin_email: string;
}

export function AuditClient({ initialLogs }: { initialLogs: AuditRecord[] }) {
  const [logs] = useState<AuditRecord[]>(initialLogs);
  const [activeMeta, setActiveMeta] = useState<any | null>(null);

  // Filters
  const [adminFilter, setAdminFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLogs = logs.filter(l => {
    if (adminFilter !== "all" && l.admin_email !== adminFilter) return false;
    if (entityFilter !== "all" && l.entity !== entityFilter) return false;
    if (actionFilter !== "all" && l.action !== actionFilter) return false;
    return true;
  });

  // Extract unique filter fields
  const uniqueAdmins = Array.from(new Set(logs.map(l => l.admin_email)));
  const uniqueEntities = Array.from(new Set(logs.map(l => l.entity)));
  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  const handleExport = () => {
    const csvData = filteredLogs.map(l => ({
      Timestamp: new Date(l.created_at).toLocaleString(),
      AdminName: l.admin_name,
      AdminEmail: l.admin_email,
      ActionType: l.action,
      TargetEntity: l.entity,
      TargetId: l.entity_id,
      IPAddress: l.ip_address,
      Metadata: JSON.stringify(l.metadata)
    }));
    exportToCSV(csvData, `eventic_audit_logs_${new Date().toISOString().substring(0, 10)}.csv`);
    toast.success("Audit log export completed successfully");
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      <div className="flex justify-between items-center">
        <AdminHeader
          title="Security Audit Log"
          description="Immutable record of administrative operations and database interactions"
        />
        <Button
          onClick={handleExport}
          className="bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-850 font-extrabold gap-1.5 cursor-pointer rounded-xl h-10 px-4 text-xs"
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-neutral-900/10 p-4 border border-neutral-850 rounded-2xl text-xs">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-neutral-500" />
          <select
            value={adminFilter}
            onChange={e => setAdminFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
          >
            <option value="all">All Administrators</option>
            {uniqueAdmins.map(email => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>

          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
          >
            <option value="all">All Targets</option>
            {uniqueEntities.map(ent => (
              <option key={ent} value={ent}>{ent}</option>
            ))}
          </select>

          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-12 text-center text-xs text-neutral-500">
          No audit logs match active filter configurations.
        </div>
      ) : (
        <div className="relative">
          <AdminTable headers={["Timestamp", "Admin executor", "Action", "Entity target", "IP address", "Metadata details"]}>
            {filteredLogs.map((l) => (
              <tr key={l.id} className="text-neutral-350 hover:bg-neutral-900/20 transition-colors">
                <td className="p-4 text-xs text-neutral-400">
                  {new Date(l.created_at).toLocaleString()}
                </td>
                <td className="p-4 text-xs">
                  <span className="block text-white font-bold">{l.admin_name}</span>
                  <span className="block text-neutral-500 text-[10px] mt-0.5">{l.admin_email}</span>
                </td>
                <td className="p-4 text-xs">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-neutral-900 border border-neutral-800 text-neutral-400">
                    {l.action}
                  </span>
                </td>
                <td className="p-4 text-xs text-neutral-400">
                  <span className="block font-bold capitalize">{l.entity}</span>
                  <span className="block text-[10px] text-neutral-500 font-mono mt-0.5">{l.entity_id}</span>
                </td>
                <td className="p-4 text-xs text-neutral-500 font-mono">
                  {l.ip_address}
                </td>
                <td className="p-4">
                  {Object.keys(l.metadata || {}).length > 0 ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setActiveMeta(l.metadata)}
                      className="text-neutral-400 hover:text-white cursor-pointer size-8"
                      title="View Metadata"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span className="text-neutral-600 text-xs font-bold">-</span>
                  )}
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>
      )}

      {/* Metadata JSON Modal */}
      {activeMeta && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h3 className="text-sm font-extrabold text-white">Event Log Metadata</h3>
              <Button variant="ghost" size="xs" onClick={() => setActiveMeta(null)} className="text-neutral-500 hover:text-white">Close</Button>
            </div>
            <pre className="bg-neutral-900 border border-neutral-850 p-4 rounded-xl text-[10px] font-mono text-neutral-300 overflow-x-auto whitespace-pre">
              {JSON.stringify(activeMeta, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
