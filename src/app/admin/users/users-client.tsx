"use client";

import { useState, useTransition } from "react";
import {
  AdminHeader,
  AdminTable,
  AdminBadge,
  AdminEmptyState
} from "@/components/admin/ui";
import { UserDetailDrawer } from "@/components/admin/drawers";
import {
  suspendUser,
  reactivateUser,
  resetUserPassword,
  deleteUser
} from "@/app/admin/actions";
import { exportToCSV } from "@/lib/admin/export";
import { toast } from "sonner";
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Download,
  AlertOctagon,
  Unlock,
  Trash2,
  CheckCircle,
  Eye,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  is_suspended: boolean;
  created_at: string;
  organizations_count: number;
  registrations_count: number;
}

export function UsersClient({ initialProfiles }: { initialProfiles: UserProfile[] }) {
  const [profiles, setProfiles] = useState<UserProfile[]>(initialProfiles);
  
  // States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [orgFilter, setOrgFilter] = useState<"all" | "has_org" | "no_org">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most_events" | "most_tickets">("newest");
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDrawerId, setActiveDrawerId] = useState<string | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Reset password temp state
  const [tempPassInfo, setTempPassInfo] = useState<{ userId: string; pass: string } | null>(null);

  // Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredProfiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProfiles.map(p => p.id));
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
  const handleSuspend = (id: string) => {
    if (!confirm("Are you sure you want to suspend this user?")) return;
    startTransition(async () => {
      try {
        await suspendUser(id);
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_suspended: true } : p));
        toast.success("User suspended successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to suspend user");
      }
    });
  };

  const handleReactivate = (id: string) => {
    startTransition(async () => {
      try {
        await reactivateUser(id);
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_suspended: false } : p));
        toast.success("User reactivated successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to reactivate user");
      }
    });
  };

  const handleResetPassword = (id: string) => {
    if (!confirm("Are you sure you want to reset this user's password?")) return;
    startTransition(async () => {
      try {
        const res = await resetUserPassword(id);
        if (res.success && res.tempPassword) {
          setTempPassInfo({ userId: id, pass: res.tempPassword });
          toast.success("Password reset successfully. See below for temporary key.");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to reset password");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("CRITICAL: Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteUser(id);
        setProfiles(prev => prev.filter(p => p.id !== id));
        setSelectedIds(prev => prev.filter(x => x !== id));
        toast.success("User deleted permanently");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete user");
      }
    });
  };

  // Bulk Actions
  const handleBulkSuspend = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to suspend the ${selectedIds.length} selected users?`)) return;
    startTransition(async () => {
      try {
        for (const id of selectedIds) {
          await suspendUser(id);
        }
        setProfiles(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, is_suspended: true } : p));
        toast.success(`Successfully suspended ${selectedIds.length} users`);
        setSelectedIds([]);
      } catch (err: any) {
        toast.error("Failed to complete bulk operations");
      }
    });
  };

  const handleBulkExport = () => {
    const dataToExport = filteredProfiles.map(p => ({
      ID: p.id,
      Email: p.email,
      Name: p.full_name || "",
      Role: p.role,
      Status: p.is_suspended ? "Suspended" : "Active",
      Organizations: p.organizations_count,
      Tickets: p.registrations_count,
      CreatedDate: new Date(p.created_at).toLocaleDateString()
    }));
    exportToCSV(dataToExport, "users");
    toast.success("Exported current users list to CSV");
  };

  // Filter & Sort computation
  const filteredProfiles = profiles
    .filter(p => {
      const matchSearch =
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "suspended" && p.is_suspended) ||
        (statusFilter === "active" && !p.is_suspended);

      const matchOrg =
        orgFilter === "all" ||
        (orgFilter === "has_org" && p.organizations_count > 0) ||
        (orgFilter === "no_org" && p.organizations_count === 0);

      return matchSearch && matchStatus && matchOrg;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "most_events") return b.organizations_count - a.organizations_count;
      if (sortBy === "most_tickets") return b.registrations_count - a.registrations_count;
      return 0;
    });

  return (
    <div className="space-y-8 font-sans">
      <AdminHeader
        title="Users Console"
        description="Verify, audit, and regulate user privileges on Eventic"
        actions={
          <Button
            onClick={handleBulkExport}
            disabled={filteredProfiles.length === 0}
            className="h-10 px-4 rounded-xl text-xs bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      {/* Temp password toast box */}
      {tempPassInfo && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center animate-in fade-in">
          <div>
            <p className="text-xs font-bold text-amber-400">Temporary Password Key Generated</p>
            <p className="font-mono text-sm text-white mt-1 select-all">{tempPassInfo.pass}</p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setTempPassInfo(null)}
            className="text-neutral-400 hover:text-white"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Filter and Control actions panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-neutral-950 p-4 rounded-2xl border border-neutral-900">
        {/* Search & dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
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
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={orgFilter}
              onChange={e => setOrgFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
            >
              <option value="all">All Affiliations</option>
              <option value="has_org">Has Organization</option>
              <option value="no_org">No Organization</option>
            </select>
          </div>
        </div>

        {/* Sort options */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-neutral-500" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="most_events">Sort: Most Orgs Owned</option>
            <option value="most_tickets">Sort: Most Tickets</option>
          </select>
        </div>
      </div>

      {/* Bulk action selection bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 bg-neutral-900/40 p-4 border border-neutral-850 rounded-2xl animate-in slide-in-from-top-1 text-xs justify-between">
          <div className="text-neutral-300 font-bold">
            {selectedIds.length} users selected
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBulkSuspend}
              disabled={isPending}
              className="h-8 px-3 rounded-lg text-xs bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/60 gap-1.5 cursor-pointer"
            >
              <AlertOctagon className="h-3.5 w-3.5" /> Suspend
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

      {/* Profiles table */}
      {filteredProfiles.length === 0 ? (
        <AdminEmptyState
          title="No users match current filters"
          description="Refine your active search parameters or filter checkboxes."
          icon={Users}
        />
      ) : (
        <div className="relative">
          <AdminTable headers={["", "User Details", "System Role", "Affiliation", "Activity Stats", "Created At", "Status", ""]}>
            {filteredProfiles.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <tr key={p.id} className="text-neutral-350 hover:bg-neutral-900/20 transition-colors">
                  <td className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(p.id)}
                      className="rounded border-neutral-800 bg-neutral-950 text-white accent-white cursor-pointer h-4 w-4"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-xs text-white">
                        {p.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-extrabold text-white block text-sm leading-none mb-1">{p.full_name || "Eventic User"}</span>
                        <span className="text-xs text-neutral-500 block">{p.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <AdminBadge role={p.role} className="text-[9px]" />
                  </td>
                  <td className="p-4">
                    {p.organizations_count > 0 ? (
                      <span className="text-xs text-white font-medium bg-neutral-900 px-2 py-0.5 border border-neutral-800 rounded-md">Host Owner</span>
                    ) : (
                      <span className="text-neutral-500 text-xs">Attendee</span>
                    )}
                  </td>
                  <td className="p-4 text-xs">
                    <span className="block text-white font-bold">{p.organizations_count} Orgs Owned</span>
                    <span className="block text-neutral-500 text-[10px] mt-0.5">{p.registrations_count} Tickets Checked</span>
                  </td>
                  <td className="p-4 text-xs text-neutral-500">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-xs">
                    {p.is_suspended ? (
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
                        onClick={() => setActiveDrawerId(p.id)}
                        className="text-neutral-400 hover:text-white cursor-pointer size-8"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {/* Action trigger menu toggle */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setActiveActionMenuId(activeActionMenuId === p.id ? null : p.id)}
                        className="text-neutral-400 hover:text-white cursor-pointer size-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      
                      {activeActionMenuId === p.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveActionMenuId(null)} />
                          <div className="absolute right-4 top-12 z-20 w-44 rounded-xl border border-neutral-850 bg-neutral-950 p-1.5 shadow-xl animate-in fade-in duration-200">
                            {p.is_suspended ? (
                              <button
                                onClick={() => { handleReactivate(p.id); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-emerald-400 hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Activate
                              </button>
                            ) : (
                              <button
                                onClick={() => { handleSuspend(p.id); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                              >
                                <AlertOctagon className="h-3.5 w-3.5" /> Suspend
                              </button>
                            )}
                            <button
                              onClick={() => { handleResetPassword(p.id); setActiveActionMenuId(null); }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-neutral-300 hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                            >
                              <Unlock className="h-3.5 w-3.5" /> Reset Pass
                            </button>
                            <button
                              onClick={() => { handleDelete(p.id); setActiveActionMenuId(null); }}
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
      <UserDetailDrawer
        userId={activeDrawerId}
        isOpen={!!activeDrawerId}
        onClose={() => setActiveDrawerId(null)}
      />
    </div>
  );
}
