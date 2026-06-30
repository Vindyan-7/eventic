"use client";

import { useState, useTransition } from "react";
import {
  AdminHeader,
  AdminTable,
  AdminBadge,
  AdminEmptyState
} from "@/components/admin/ui";
import { revokeScannerSession, extendScannerSession } from "@/app/admin/actions";
import { exportToCSV } from "@/lib/admin/export";
import { toast } from "sonner";
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Download,
  Ban,
  CalendarDays,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScannerSession {
  id: string;
  code: string;
  expires_at: string;
  created_at: string;
  event_title: string;
  organization_name: string;
}

export function ScannerClient({ initialSessions }: { initialSessions: ScannerSession[] }) {
  const [sessions, setSessions] = useState<ScannerSession[]>(initialSessions);

  // States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredSessions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSessions.map(s => s.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Actions
  const handleRevoke = (id: string) => {
    if (!confirm("Are you sure you want to revoke this scanner code session immediately?")) return;
    startTransition(async () => {
      try {
        await revokeScannerSession(id);
        setSessions(prev => prev.filter(s => s.id !== id));
        setSelectedIds(prev => prev.filter(x => x !== id));
        toast.success("Scanner session code revoked");
      } catch (err: any) {
        toast.error(err.message || "Failed to revoke session");
      }
    });
  };

  const handleExtend = (id: string) => {
    startTransition(async () => {
      try {
        await extendScannerSession(id);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSessions(prev => prev.map(s => s.id === id ? { ...s, expires_at: tomorrow.toISOString() } : s));
        toast.success("Scanner session validity extended by 24 hours");
      } catch (err: any) {
        toast.error(err.message || "Failed to extend session");
      }
    });
  };

  // Bulk Actions
  const handleBulkRevoke = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to revoke the ${selectedIds.length} selected scanner codes?`)) return;
    startTransition(async () => {
      try {
        for (const id of selectedIds) {
          await revokeScannerSession(id);
        }
        setSessions(prev => prev.filter(s => !selectedIds.includes(s.id)));
        toast.success(`Successfully revoked ${selectedIds.length} scanner sessions`);
        setSelectedIds([]);
      } catch {
        toast.error("Bulk revocation failed");
      }
    });
  };

  const handleBulkExport = () => {
    const dataToExport = filteredSessions.map(s => ({
      ID: s.id,
      StaffCode: s.code,
      Event: s.event_title,
      Organization: s.organization_name,
      Status: new Date(s.expires_at).getTime() > Date.now() ? "Active" : "Expired",
      CreatedAt: new Date(s.created_at).toLocaleString(),
      ExpiresAt: new Date(s.expires_at).toLocaleString()
    }));
    exportToCSV(dataToExport, "scanners");
    toast.success("Exported current scanner sessions to CSV");
  };

  // Filter & Sort
  const filteredSessions = sessions
    .filter(s => {
      const matchSearch =
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        s.event_title.toLowerCase().includes(search.toLowerCase()) ||
        s.organization_name.toLowerCase().includes(search.toLowerCase());

      const isExpired = new Date(s.expires_at).getTime() < Date.now();
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "expired" && isExpired) ||
        (statusFilter === "active" && !isExpired);

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return 0;
    });

  return (
    <div className="space-y-8 font-sans">
      <AdminHeader
        title="Scanner Portal Management"
        description="Monitor staff entry check-in authorizations and active scan codes"
        actions={
          <Button
            onClick={handleBulkExport}
            disabled={filteredSessions.length === 0}
            className="h-10 px-4 rounded-xl text-xs bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      {/* Filter and Control actions panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-neutral-950 p-4 rounded-2xl border border-neutral-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by staff code or event..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-neutral-500" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
            >
              <option value="all">All Sessions</option>
              <option value="active">Active Sessions</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-neutral-500" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>
        </div>
      </div>

      {/* Bulk action selection bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 bg-neutral-900/40 p-4 border border-neutral-850 rounded-2xl animate-in slide-in-from-top-1 text-xs justify-between">
          <div className="text-neutral-300 font-bold">
            {selectedIds.length} scanner codes selected
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBulkRevoke}
              disabled={isPending}
              className="h-8 px-3 rounded-lg text-xs bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/60 gap-1.5 cursor-pointer"
            >
              <Ban className="h-3.5 w-3.5" /> Revoke Selected
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setSelectedIds([])}
              className="text-neutral-400 hover:text-white"
            >
              Clear selection
            </Button>
          </div>
        </div>
      )}

      {/* Scanners Table */}
      {filteredSessions.length === 0 ? (
        <AdminEmptyState
          title="No scanner sessions found"
          description="Refine your active search parameters or filters."
          icon={QrCode}
        />
      ) : (
        <div className="relative">
          <AdminTable headers={["", "Staff Code", "Event & Organization", "Created At", "Expires At", "Status", ""]}>
            {filteredSessions.map((session) => {
              const isSelected = selectedIds.includes(session.id);
              const isExpired = new Date(session.expires_at).getTime() < Date.now();
              return (
                <tr key={session.id} className="text-neutral-350 hover:bg-neutral-900/20 transition-colors">
                  <td className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(session.id)}
                      className="rounded border-neutral-800 bg-neutral-950 text-white accent-white cursor-pointer h-4 w-4"
                    />
                  </td>
                  <td className="p-4 font-mono text-xs font-bold text-white">
                    {session.code}
                  </td>
                  <td className="p-4">
                    <div>
                      <span className="font-extrabold text-white block text-sm leading-none mb-1">{session.event_title}</span>
                      <span className="text-xs text-neutral-500 block">Host: {session.organization_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-neutral-500">
                    {new Date(session.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-xs text-neutral-500">
                    {new Date(session.expires_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-xs font-bold uppercase tracking-wider">
                    {isExpired ? (
                      <span className="text-red-400">Expired</span>
                    ) : (
                      <span className="text-emerald-400">Active</span>
                    )}
                  </td>
                  <td className="p-4 relative">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setActiveActionMenuId(activeActionMenuId === session.id ? null : session.id)}
                        className="text-neutral-400 hover:text-white cursor-pointer size-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {activeActionMenuId === session.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveActionMenuId(null)} />
                          <div className="absolute right-4 top-12 z-20 w-44 rounded-xl border border-neutral-850 bg-neutral-950 p-1.5 shadow-xl animate-in fade-in duration-200">
                            <button
                              onClick={() => { handleExtend(session.id); setActiveActionMenuId(null); }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-neutral-300 hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                            >
                              <CalendarDays className="h-3.5 w-3.5" /> Extend 24h
                            </button>
                            <button
                              onClick={() => { handleRevoke(session.id); setActiveActionMenuId(null); }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                            >
                              <Ban className="h-3.5 w-3.5" /> Revoke Key
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </AdminTable>
        </div>
      )}
    </div>
  );
}
