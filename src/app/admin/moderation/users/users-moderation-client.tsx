"use client";

import { useState, useTransition } from "react";
import {
  AdminHeader,
  AdminTable,
  AdminBadge,
  AdminEmptyState
} from "@/components/admin/ui";
import { UserDetailDrawer } from "@/components/admin/drawers";
import { suspendUser, reactivateUser, deleteUser } from "@/app/admin/actions";
import { toast } from "sonner";
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Eye,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_suspended: boolean;
  suspension_reason: string | null;
  created_at: string;
  organizations_count: number;
  registrations_count: number;
}

export function UsersModerationClient({ initialProfiles }: { initialProfiles: UserProfile[] }) {
  const [profiles, setProfiles] = useState<UserProfile[]>(initialProfiles);
  const [activeDrawerId, setActiveDrawerId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Suspension Modal State
  const [suspendingUserId, setSuspendingUserId] = useState<string | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("Spam");

  const handleSuspend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendingUserId) return;

    startTransition(async () => {
      try {
        await suspendUser(suspendingUserId, suspensionReason);
        setProfiles(prev => prev.map(p => p.id === suspendingUserId ? { ...p, is_suspended: true, suspension_reason: suspensionReason } : p));
        toast.success("User suspended successfully");
        setSuspendingUserId(null);
      } catch (err: any) {
        toast.error(err.message || "Failed to suspend user");
      }
    });
  };

  const handleReactivate = (id: string) => {
    startTransition(async () => {
      try {
        await reactivateUser(id);
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_suspended: false, suspension_reason: null } : p));
        toast.success("User reactivated successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to reactivate user");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user account? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteUser(id);
        setProfiles(prev => prev.filter(p => p.id !== id));
        toast.success("User deleted permanently");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete user");
      }
    });
  };

  return (
    <div className="space-y-8 font-sans">
      <AdminHeader
        title="User Moderation Portal"
        description="Audit accounts, suspend malicious profiles, and restore verified users"
      />

      <div className="relative">
        <AdminTable headers={["User Profile details", "Privileges", "Organizations Owned", "Tickets", "Status", "Reason", "Moderation Actions"]}>
          {profiles.map((p) => (
            <tr key={p.id} className="text-neutral-350 hover:bg-neutral-900/20 transition-colors">
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
              <td className="p-4 text-xs font-bold text-white">
                {p.organizations_count} orgs
              </td>
              <td className="p-4 text-xs font-bold text-white">
                {p.registrations_count} tickets
              </td>
              <td className="p-4 text-xs">
                {p.is_suspended ? (
                  <span className="text-red-400 font-bold uppercase tracking-wider text-[10px]">Suspended</span>
                ) : (
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Active</span>
                )}
              </td>
              <td className="p-4 text-xs text-neutral-500 max-w-44 truncate">
                {p.suspension_reason || "-"}
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setActiveDrawerId(p.id)}
                    className="text-neutral-400 hover:text-white cursor-pointer size-8"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {p.is_suspended ? (
                    <Button
                      size="xs"
                      onClick={() => handleReactivate(p.id)}
                      className="bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 hover:bg-emerald-950/60 text-xs font-bold gap-1 cursor-pointer rounded-lg px-2 h-8"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Restore
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      onClick={() => setSuspendingUserId(p.id)}
                      className="bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/60 text-xs font-bold gap-1 cursor-pointer rounded-lg px-2 h-8"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" /> Suspend
                    </Button>
                  )}

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(p.id)}
                    className="text-neutral-500 hover:text-red-400 cursor-pointer size-8"
                    title="Delete Account"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>

      {/* Suspend user dialog overlay */}
      {suspendingUserId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h3 className="text-base font-extrabold text-white">Suspend Account</h3>
              <Button variant="ghost" size="xs" onClick={() => setSuspendingUserId(null)} className="text-neutral-500 hover:text-white">Close</Button>
            </div>
            <form onSubmit={handleSuspend} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-bold block">Reason for suspension</label>
                <select
                  value={suspensionReason}
                  onChange={e => setSuspensionReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                >
                  <option value="Spam">Spam</option>
                  <option value="Fraud">Fraud</option>
                  <option value="Abuse">Abuse</option>
                  <option value="Terms Violation">Terms Violation</option>
                  <option value="Test Account">Test Account</option>
                </select>
              </div>
              <Button type="submit" disabled={isPending} className="w-full h-10 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold cursor-pointer mt-2">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-black" /> : "Suspend User"}
              </Button>
            </form>
          </div>
        </div>
      )}

      <UserDetailDrawer
        userId={activeDrawerId}
        isOpen={!!activeDrawerId}
        onClose={() => setActiveDrawerId(null)}
      />
    </div>
  );
}
