"use client";

import { useState, useTransition } from "react";
import {
  AdminHeader,
  AdminTable,
  AdminBadge,
  AdminEmptyState,
} from "@/components/admin/ui";
import { AdminDetailDrawer } from "@/components/admin/drawers";
import {
  createAdminUser,
  updateAdminUser,
  deleteAdminUser
} from "@/app/admin/actions";
import { AdminUser } from "@/lib/admin/auth";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Loader2,
  ShieldAlert,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminProfileRecord {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  email: string;
  full_name: string;
  avatar_url: string | null;
}

export function AdminsClient({
  initialAdmins,
  currentAdmin
}: {
  initialAdmins: AdminProfileRecord[];
  currentAdmin: AdminUser;
}) {
  const [admins, setAdmins] = useState<AdminProfileRecord[]>(initialAdmins);

  // Filter States
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [activeDrawerId, setActiveDrawerId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Create Admin Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState("viewer");
  const [createActive, setCreateActive] = useState(true);

  // Edit Admin Dialog State
  const [editingAdmin, setEditingAdmin] = useState<AdminProfileRecord | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editActive, setEditActive] = useState(true);

  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  const isSuperAdmin = currentAdmin.role === "super_admin";

  // Handlers
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail) return;
    startTransition(async () => {
      try {
        await createAdminUser(createEmail, createRole, createActive);
        toast.success("Administrator privilege provisioned successfully");
        setIsCreateOpen(false);
        setCreateEmail("");
        // Force state refresh
        window.location.reload();
      } catch (err: any) {
        toast.error(err.message || "Failed to provision administrator privileges");
      }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    startTransition(async () => {
      try {
        await updateAdminUser(editingAdmin.id, editRole, editActive);
        toast.success("Administrator privileges updated");
        setEditingAdmin(null);
        window.location.reload();
      } catch (err: any) {
        toast.error(err.message || "Failed to update privileges");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to permanently revoke all administrator privileges for this account?")) return;
    startTransition(async () => {
      try {
        await deleteAdminUser(id);
        setAdmins(prev => prev.filter(a => a.id !== id));
        toast.success("Administrator privilege revoked");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete administrator");
      }
    });
  };

  // Filter Computation
  const filteredAdmins = admins.filter(a => {
    const matchSearch =
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.full_name.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === "all" || a.role === roleFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && a.is_active) ||
      (statusFilter === "inactive" && !a.is_active);

    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-8 font-sans">
      <AdminHeader
        title="Admin Management"
        description="Verify, audit, and regulate console administrator access levels"
        actions={
          isSuperAdmin && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="h-10 px-4 rounded-xl text-xs bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Provision Admin
            </Button>
          )
        }
      />

      {/* Filters Panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-neutral-950 p-4 rounded-2xl border border-neutral-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search admin by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-neutral-500" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="platform_admin">Platform Admin</option>
              <option value="support_admin">Support Admin</option>
              <option value="finance_admin">Finance Admin</option>
              <option value="moderator">Moderator</option>
              <option value="viewer">Viewer</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredAdmins.length === 0 ? (
        <AdminEmptyState
          title="No administrators match search criteria"
          description="Adjust your filters or query text."
          icon={UserCheck}
        />
      ) : (
        <div className="relative">
          <AdminTable headers={["Administrator details", "Assigned Privilege", "Status", "Last Login Session", "Registered Date", ""]}>
            {filteredAdmins.map((admin) => (
              <tr key={admin.id} className="text-neutral-350 hover:bg-neutral-900/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-xs text-white">
                      {admin.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-extrabold text-white block text-sm leading-none mb-1">{admin.full_name}</span>
                      <span className="text-xs text-neutral-500 block">{admin.email}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <AdminBadge role={admin.role} className="text-[9px]" />
                </td>
                <td className="p-4 text-xs font-bold uppercase tracking-wider">
                  {admin.is_active ? (
                    <span className="text-emerald-400">Active</span>
                  ) : (
                    <span className="text-red-400">Inactive</span>
                  )}
                </td>
                <td className="p-4 text-xs text-neutral-450">
                  {admin.last_login_at ? new Date(admin.last_login_at).toLocaleString() : "Never logged in"}
                </td>
                <td className="p-4 text-xs text-neutral-500">
                  {new Date(admin.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 relative">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setActiveDrawerId(admin.id)}
                      className="text-neutral-400 hover:text-white cursor-pointer size-8"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {isSuperAdmin && admin.id !== currentAdmin.id && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingAdmin(admin);
                            setEditRole(admin.role);
                            setEditActive(admin.is_active);
                          }}
                          className="text-neutral-400 hover:text-white cursor-pointer size-8"
                          title="Edit Admin"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(admin.id)}
                          className="text-neutral-400 hover:text-red-400 cursor-pointer size-8"
                          title="Revoke Admin Access"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>
      )}

      {/* Create Admin Dialog Overlay */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h3 className="text-base font-extrabold text-white">Create Platform Admin</h3>
              <Button variant="ghost" size="xs" onClick={() => setIsCreateOpen(false)} className="text-neutral-500 hover:text-white">Close</Button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-bold block">User Email</label>
                <input
                  type="email"
                  required
                  placeholder="enter registered user email..."
                  value={createEmail}
                  onChange={e => setCreateEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white outline-none focus:border-neutral-700 placeholder:text-neutral-600 font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-bold block">Privilege Level (Role)</label>
                <select
                  value={createRole}
                  onChange={e => setCreateRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="platform_admin">Platform Admin</option>
                  <option value="support_admin">Support Admin</option>
                  <option value="finance_admin">Finance Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={createActive}
                  onChange={e => setCreateActive(e.target.checked)}
                  className="rounded border-neutral-850 bg-neutral-900 text-white accent-white h-4 w-4 cursor-pointer"
                  id="createActive"
                />
                <label htmlFor="createActive" className="text-neutral-300 font-bold cursor-pointer">Set active on creation</label>
              </div>
              <Button type="submit" disabled={isPending} className="w-full h-10 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold cursor-pointer mt-2">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-black" /> : "Provision Privilege"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Dialog Overlay */}
      {editingAdmin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h3 className="text-base font-extrabold text-white">Edit Administrator Privileges</h3>
              <Button variant="ghost" size="xs" onClick={() => setEditingAdmin(null)} className="text-neutral-500 hover:text-white">Close</Button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-neutral-500 font-bold block uppercase tracking-wider text-[9px]">Account Email</label>
                <p className="text-xs font-bold text-neutral-300">{editingAdmin.email}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-bold block">Privilege Level (Role)</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="platform_admin">Platform Admin</option>
                  <option value="support_admin">Support Admin</option>
                  <option value="finance_admin">Finance Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={e => setEditActive(e.target.checked)}
                  className="rounded border-neutral-850 bg-neutral-900 text-white accent-white h-4 w-4 cursor-pointer"
                  id="editActive"
                />
                <label htmlFor="editActive" className="text-neutral-300 font-bold cursor-pointer">Account is active</label>
              </div>
              <Button type="submit" disabled={isPending} className="w-full h-10 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold cursor-pointer mt-2">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-black" /> : "Save Changes"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Details drawer sheet */}
      <AdminDetailDrawer
        adminId={activeDrawerId}
        isOpen={!!activeDrawerId}
        onClose={() => setActiveDrawerId(null)}
      />
    </div>
  );
}
