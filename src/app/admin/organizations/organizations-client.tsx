"use client";

import { useState, useTransition } from "react";
import {
  AdminHeader,
  AdminTable,
  AdminBadge,
  AdminEmptyState
} from "@/components/admin/ui";
import { OrgDetailDrawer } from "@/components/admin/drawers";
import {
  approveOrganization,
  rejectOrganization,
  suspendOrganization,
  reactivateOrganization,
  deleteOrganization
} from "@/app/admin/actions";
import { exportToCSV } from "@/lib/admin/export";
import { toast } from "sonner";
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Download,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Trash2,
  Eye,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  verification_status: "pending" | "approved" | "rejected";
  is_suspended: boolean;
  created_at: string;
  owner_name: string;
  owner_email: string;
  events_count: number;
  revenue: number;
}

export function OrganizationsClient({ initialOrganizations }: { initialOrganizations: Organization[] }) {
  const [orgs, setOrgs] = useState<Organization[]>(initialOrganizations);

  // States
  const [search, setSearch] = useState("");
  const [verifyFilter, setVerifyFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "events" | "revenue">("newest");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDrawerId, setActiveDrawerId] = useState<string | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredOrgs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrgs.map(o => o.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Individual Actions
  const handleApprove = (id: string) => {
    startTransition(async () => {
      try {
        await approveOrganization(id);
        setOrgs(prev => prev.map(o => o.id === id ? { ...o, verification_status: "approved" } : o));
        toast.success("Organization approved and verified");
      } catch (err: any) {
        toast.error(err.message || "Failed to approve organization");
      }
    });
  };

  const handleReject = (id: string) => {
    if (!confirm("Are you sure you want to reject this organization's verification request?")) return;
    startTransition(async () => {
      try {
        await rejectOrganization(id);
        setOrgs(prev => prev.map(o => o.id === id ? { ...o, verification_status: "rejected" } : o));
        toast.success("Organization verification request rejected");
      } catch (err: any) {
        toast.error(err.message || "Failed to reject organization");
      }
    });
  };

  const handleSuspend = (id: string) => {
    if (!confirm("Are you sure you want to suspend this organization? This disables event hosting access.")) return;
    startTransition(async () => {
      try {
        await suspendOrganization(id);
        setOrgs(prev => prev.map(o => o.id === id ? { ...o, is_suspended: true } : o));
        toast.success("Organization suspended successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to suspend organization");
      }
    });
  };

  const handleReactivate = (id: string) => {
    startTransition(async () => {
      try {
        await reactivateOrganization(id);
        setOrgs(prev => prev.map(o => o.id === id ? { ...o, is_suspended: false } : o));
        toast.success("Organization reactivated successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to reactivate organization");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("CRITICAL: Permanent deletion will clear this organization and all its hosted events. Continue?")) return;
    startTransition(async () => {
      try {
        await deleteOrganization(id);
        setOrgs(prev => prev.filter(o => o.id !== id));
        setSelectedIds(prev => prev.filter(x => x !== id));
        toast.success("Organization deleted permanently");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete organization");
      }
    });
  };

  // Bulk Actions
  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      try {
        for (const id of selectedIds) {
          await approveOrganization(id);
        }
        setOrgs(prev => prev.map(o => selectedIds.includes(o.id) ? { ...o, verification_status: "approved" } : o));
        toast.success(`Verified ${selectedIds.length} organizations`);
        setSelectedIds([]);
      } catch {
        toast.error("Bulk approval failed");
      }
    });
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to reject the verification for ${selectedIds.length} selected organizations?`)) return;
    startTransition(async () => {
      try {
        for (const id of selectedIds) {
          await rejectOrganization(id);
        }
        setOrgs(prev => prev.map(o => selectedIds.includes(o.id) ? { ...o, verification_status: "rejected" } : o));
        toast.success(`Rejected verification for ${selectedIds.length} organizations`);
        setSelectedIds([]);
      } catch {
        toast.error("Bulk rejection failed");
      }
    });
  };

  const handleBulkExport = () => {
    const dataToExport = filteredOrgs.map(o => ({
      ID: o.id,
      Name: o.name,
      Slug: o.slug,
      OwnerEmail: o.owner_email,
      Verification: o.verification_status,
      Status: o.is_suspended ? "Suspended" : "Active",
      EventsHosted: o.events_count,
      TotalRevenue: o.revenue,
      CreatedDate: new Date(o.created_at).toLocaleDateString()
    }));
    exportToCSV(dataToExport, "organizations");
    toast.success("Exported current organization list to CSV");
  };

  // Filter & Sort
  const filteredOrgs = orgs
    .filter(o => {
      const matchSearch =
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.owner_email.toLowerCase().includes(search.toLowerCase()) ||
        o.slug.toLowerCase().includes(search.toLowerCase());

      const matchVerify = verifyFilter === "all" || o.verification_status === verifyFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "suspended" && o.is_suspended) ||
        (statusFilter === "active" && !o.is_suspended);

      return matchSearch && matchVerify && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "events") return b.events_count - a.events_count;
      if (sortBy === "revenue") return b.revenue - a.revenue;
      return 0;
    });

  return (
    <div className="space-y-8 font-sans">
      <AdminHeader
        title="Organizations Console"
        description="Verify host clubs, audit verification states, and monitor sales metrics"
        actions={
          <Button
            onClick={handleBulkExport}
            disabled={filteredOrgs.length === 0}
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
              placeholder="Search by organization name or slug..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-neutral-500" />
            <select
              value={verifyFilter}
              onChange={e => setVerifyFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
            >
              <option value="all">All Verifications</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
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
            <option value="events">Sort: Most Events</option>
            <option value="revenue">Sort: Highest Revenue</option>
          </select>
        </div>
      </div>

      {/* Bulk action selection bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 bg-neutral-900/40 p-4 border border-neutral-850 rounded-2xl animate-in slide-in-from-top-1 text-xs justify-between">
          <div className="text-neutral-300 font-bold">
            {selectedIds.length} organizations selected
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBulkApprove}
              disabled={isPending}
              className="h-8 px-3 rounded-lg text-xs bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 hover:bg-emerald-950/60 gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button
              onClick={handleBulkReject}
              disabled={isPending}
              className="h-8 px-3 rounded-lg text-xs bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/60 gap-1.5 cursor-pointer"
            >
              <XCircle className="h-3.5 w-3.5" /> Reject
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

      {/* Organizations Table */}
      {filteredOrgs.length === 0 ? (
        <AdminEmptyState
          title="No organizations match current filters"
          description="Refine your active search parameters or verification filters."
          icon={Building}
        />
      ) : (
        <div className="relative">
          <AdminTable headers={["", "Organization", "Owner Info", "Events", "Revenue", "Verification", "Status", ""]}>
            {filteredOrgs.map((org) => {
              const isSelected = selectedIds.includes(org.id);
              return (
                <tr key={org.id} className="text-neutral-350 hover:bg-neutral-900/20 transition-colors">
                  <td className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(org.id)}
                      className="rounded border-neutral-800 bg-neutral-950 text-white accent-white cursor-pointer h-4 w-4"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-xs text-white">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-extrabold text-white block text-sm leading-none mb-1">{org.name}</span>
                        <span className="text-xs text-neutral-500 block">slug: {org.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs">
                    <span className="block text-white font-bold">{org.owner_name}</span>
                    <span className="block text-neutral-500 text-[10px] mt-0.5">{org.owner_email}</span>
                  </td>
                  <td className="p-4 text-xs text-white font-bold">
                    {org.events_count} events
                  </td>
                  <td className="p-4 text-xs text-white font-bold">
                    ₹{org.revenue.toLocaleString()}
                  </td>
                  <td className="p-4 text-xs">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-white">
                      {org.verification_status}
                    </span>
                  </td>
                  <td className="p-4 text-xs">
                    {org.is_suspended ? (
                      <span className="text-red-400 font-bold uppercase tracking-wider text-[10px]">Suspended</span>
                    ) : (
                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Active</span>
                    )}
                  </td>
                  <td className="p-4 relative">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setActiveDrawerId(org.id)}
                        className="text-neutral-400 hover:text-white cursor-pointer size-8"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setActiveActionMenuId(activeActionMenuId === org.id ? null : org.id)}
                        className="text-neutral-400 hover:text-white cursor-pointer size-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {activeActionMenuId === org.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveActionMenuId(null)} />
                          <div className="absolute right-4 top-12 z-20 w-44 rounded-xl border border-neutral-850 bg-neutral-950 p-1.5 shadow-xl animate-in fade-in duration-200">
                            {org.verification_status !== "approved" && (
                              <button
                                onClick={() => { handleApprove(org.id); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-emerald-400 hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                              </button>
                            )}
                            {org.verification_status !== "rejected" && (
                              <button
                                onClick={() => { handleReject(org.id); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-neutral-300 hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </button>
                            )}
                            <div className="h-px bg-neutral-850 my-1" />
                            {org.is_suspended ? (
                              <button
                                onClick={() => { handleReactivate(org.id); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-emerald-400 hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Activate
                              </button>
                            ) : (
                              <button
                                onClick={() => { handleSuspend(org.id); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                              >
                                <AlertOctagon className="h-3.5 w-3.5" /> Suspend
                              </button>
                            )}
                            <button
                              onClick={() => { handleDelete(org.id); setActiveActionMenuId(null); }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-950/20 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
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

      {/* Details drawer sheet */}
      <OrgDetailDrawer
        orgId={activeDrawerId}
        isOpen={!!activeDrawerId}
        onClose={() => setActiveDrawerId(null)}
      />
    </div>
  );
}
