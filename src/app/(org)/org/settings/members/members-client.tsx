"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Users,
  PlusCircle,
  UserX,
  UserCheck,
  ShieldCheck,
  Search,
  Sliders,
  X,
  Mail,
  Edit2
} from "lucide-react";
import {
  inviteWorkspaceMember,
  updateMemberStatus,
  updateMemberPermissions,
  revokeWorkspaceInvitation
} from "../../actions";
import { OWNER_PERMISSIONS, WorkspacePermission } from "@/lib/workspace-auth";

interface MemberProps {
  id: string;
  display_title: string;
  permissions: any;
  status: string;
  is_owner: boolean;
  joined_at: string;
  profile: {
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface InvitationProps {
  id: string;
  email: string;
  display_title: string;
  permissions: any;
  expires_at: string;
  accepted_at: string;
}

export function WorkspaceMembersClient({
  workspace,
  currentMemberId,
  isOwner,
  initialMembers,
  initialInvitations,
  registeredUsers,
}: {
  workspace: any;
  currentMemberId: string;
  isOwner: boolean;
  initialMembers: MemberProps[];
  initialInvitations: InvitationProps[];
  registeredUsers: any[];
}) {
  const [members, setMembers] = useState<MemberProps[]>(initialMembers);
  const [invitations, setInvitations] = useState<InvitationProps[]>(initialInvitations);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditPermsOpen, setIsEditPermsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberProps | null>(null);

  // Search User States
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [displayTitle, setDisplayTitle] = useState("Coordinator");

  // Permission toggles (invite & edit)
  const [perms, setPerms] = useState<WorkspacePermission>({
    workspace: { manage: false, settings: false, members: false },
    events: { create: false, edit: false, delete: false, publish: false },
    attendees: { view: false, export: false, checkin: false },
    analytics: { view: false },
    scanner: { access: false },
    certificates: { manage: false },
    finance: { billing: false, payouts: false }
  });

  const handleUserSearch = () => {
    if (!searchEmail) return;
    const match = registeredUsers.find(u => u.email.toLowerCase() === searchEmail.trim().toLowerCase());
    setFoundUser(match || null);
    setHasSearched(true);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundUser) return;

    try {
      await inviteWorkspaceMember({
        email: foundUser.email,
        displayTitle,
        permissions: perms
      });
      toast.success(`Invitation successfully dispatched to ${foundUser.full_name}!`);
      
      const newInvite: InvitationProps = {
        id: Math.random().toString(),
        email: foundUser.email,
        display_title: displayTitle,
        permissions: perms,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        accepted_at: ""
      };
      setInvitations([newInvite, ...invitations]);
      setIsInviteOpen(false);
      resetInviteForm();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const resetInviteForm = () => {
    setSearchEmail("");
    setFoundUser(null);
    setHasSearched(false);
    setDisplayTitle("Coordinator");
    setPerms({
      workspace: { manage: false, settings: false, members: false },
      events: { create: false, edit: false, delete: false, publish: false },
      attendees: { view: false, export: false, checkin: false },
      analytics: { view: false },
      scanner: { access: false },
      certificates: { manage: false },
      finance: { billing: false, payouts: false }
    });
  };

  const handleStatusToggle = async (memberId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await updateMemberStatus(memberId, nextStatus as any);
      toast.success(`Member status updated successfully.`);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: nextStatus } : m));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRevokeInvite = async (inviteId: string, email: string) => {
    if (!confirm(`Revoke invitation for ${email}?`)) return;
    try {
      await revokeWorkspaceInvitation(inviteId);
      toast.success("Invitation successfully revoked.");
      setInvitations(prev => prev.filter(i => i.id !== inviteId));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleOpenEditPerms = (member: MemberProps) => {
    setSelectedMember(member);
    setPerms(member.permissions as WorkspacePermission);
    setIsEditPermsOpen(true);
  };

  const handleSavePerms = async () => {
    if (!selectedMember) return;
    try {
      await updateMemberPermissions(selectedMember.id, perms);
      toast.success("Permissions updated successfully.");
      setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, permissions: perms } : m));
      setIsEditPermsOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const togglePerm = (group: keyof WorkspacePermission, field: string) => {
    setPerms(prev => {
      const groupVal = { ...(prev[group] || {}) } as any;
      groupVal[field] = !groupVal[field];
      return { ...prev, [group]: groupVal };
    });
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-neutral-400" /> Workspace Members
          </h1>
          <p className="text-[10px] text-neutral-500 font-bold mt-0.5">Invite team members and configure granular platform permission controls</p>
        </div>
        {isOwner && (
          <Button
            onClick={() => setIsInviteOpen(true)}
            className="bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer rounded-xl h-9 px-3.5"
          >
            <PlusCircle className="h-4 w-4" /> Invite Member
          </Button>
        )}
      </div>

      {/* Members Directory list */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-[10px] text-neutral-400 uppercase tracking-wider">Active Workspace Directory</h3>
        <div className="border border-neutral-900 rounded-3xl overflow-hidden bg-neutral-900/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 text-neutral-500 font-bold uppercase tracking-wider text-[9px] bg-neutral-900/25">
                <th className="p-3.5 pl-5">Member</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role / Title</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Joined</th>
                <th className="p-3.5 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-neutral-300">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-neutral-900/10 transition-colors">
                  <td className="p-3.5 pl-5 font-bold text-white flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-[10px] text-neutral-300 overflow-hidden">
                      {m.profile.avatar_url ? (
                        <img src={m.profile.avatar_url} alt="" className="object-cover h-full w-full" />
                      ) : (
                        m.profile.full_name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    {m.profile.full_name}
                  </td>
                  <td className="p-3.5 text-neutral-450">{m.profile.email}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-350">{m.display_title}</span>
                      {m.is_owner && (
                        <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Owner
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      m.status === "active"
                        ? "bg-emerald-950/10 text-emerald-400 border-emerald-900/40"
                        : "bg-red-950/10 text-red-400 border-red-900/40"
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-neutral-500 font-mono text-[10px]">
                    {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-3.5 text-right pr-5 space-x-2">
                    {!m.is_owner && isOwner && (
                      <>
                        <button
                          onClick={() => handleOpenEditPerms(m)}
                          className="bg-neutral-900 hover:bg-neutral-850 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg border border-neutral-800 transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Sliders className="h-3 w-3" /> Permissions
                        </button>
                        <button
                          onClick={() => handleStatusToggle(m.id, m.status)}
                          className={`font-extrabold text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer inline-flex items-center gap-1 ${
                            m.status === "active"
                              ? "bg-red-950/20 text-red-450 border-red-900/50 hover:bg-red-950/40"
                              : "bg-emerald-950/20 text-emerald-450 border-emerald-900/50 hover:bg-emerald-950/40"
                          }`}
                        >
                          {m.status === "active" ? (
                            <>
                              <UserX className="h-3 w-3" /> Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3" /> Activate
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invitations Directory list */}
      {invitations.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="font-extrabold text-[10px] text-neutral-400 uppercase tracking-wider">Pending Workspace Invitations</h3>
          <div className="border border-neutral-900 rounded-3xl overflow-hidden bg-neutral-900/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 text-neutral-500 font-bold uppercase tracking-wider text-[9px] bg-neutral-900/25">
                  <th className="p-3.5 pl-5">Email Address</th>
                  <th className="p-3.5">Proposed Role</th>
                  <th className="p-3.5">Expiration</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                {invitations.map((i) => (
                  <tr key={i.id} className="hover:bg-neutral-900/10 transition-colors">
                    <td className="p-3.5 pl-5 font-bold text-white flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-neutral-500" />
                      {i.email}
                    </td>
                    <td className="p-3.5 font-bold text-neutral-450">{i.display_title}</td>
                    <td className="p-3.5 text-neutral-500 font-mono text-[10px]">
                      Expires: {new Date(i.expires_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      {isOwner && (
                        <button
                          onClick={() => handleRevokeInvite(i.id, i.email)}
                          className="bg-red-950/20 hover:bg-red-950/40 text-red-400 font-extrabold text-[10px] px-2.5 py-1 rounded-lg border border-red-900/50 cursor-pointer"
                        >
                          Revoke Invite
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member dialog modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl w-full max-w-lg space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <PlusCircle className="h-4.5 w-4.5 text-neutral-400" /> Invite Workspace Member
              </h2>
              <button onClick={() => { setIsInviteOpen(false); resetInviteForm(); }} className="text-neutral-500 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Email search field */}
            <div className="space-y-2">
              <label className="font-bold text-neutral-400 text-[10px] uppercase tracking-wider block">Find Eventic User</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={e => setSearchEmail(e.target.value)}
                    placeholder="Enter email to search"
                    className="w-full bg-neutral-900 border border-neutral-850 px-3 py-2 rounded-xl text-white outline-none focus:border-neutral-700 font-medium"
                  />
                </div>
                <Button type="button" onClick={handleUserSearch} className="bg-white text-black hover:bg-neutral-200 font-extrabold px-3 rounded-xl cursor-pointer">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* User Search visual result */}
            {hasSearched && (
              <div className="border border-neutral-900 p-4 rounded-2xl bg-neutral-900/10">
                {foundUser ? (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-xs overflow-hidden">
                      {foundUser.avatar_url ? (
                        <img src={foundUser.avatar_url} alt="" className="object-cover h-full w-full" />
                      ) : (
                        foundUser.full_name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-white block">{foundUser.full_name}</span>
                      <span className="text-[10px] text-neutral-500 font-bold block">{foundUser.email}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-400 font-bold text-[10px] leading-relaxed">
                    This email is not registered in Eventic. Ask the user to create an Eventic account first.
                  </p>
                )}
              </div>
            )}

            {foundUser && (
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="font-bold text-neutral-400 text-[10px] uppercase tracking-wider block">Display Title</label>
                  <input
                    type="text"
                    value={displayTitle}
                    onChange={e => setDisplayTitle(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-850 px-3 py-2 rounded-xl text-white outline-none focus:border-neutral-700 font-medium"
                  />
                </div>

                {/* Permissions matrix grouped */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <label className="font-bold text-neutral-400 text-[10px] uppercase tracking-wider block">Configure Permissions</label>
                  
                  {/* Group: Workspace */}
                  <div className="border border-neutral-900 rounded-2xl p-3 space-y-2">
                    <span className="font-bold text-white block text-[9px] uppercase tracking-wider">Workspace Access</span>
                    <div className="flex justify-between items-center">
                      <span>Manage Workspace</span>
                      <input type="checkbox" checked={perms.workspace?.manage} onChange={() => togglePerm("workspace", "manage")} className="cursor-pointer h-4 w-4 accent-white" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Workspace Settings</span>
                      <input type="checkbox" checked={perms.workspace?.settings} onChange={() => togglePerm("workspace", "settings")} className="cursor-pointer h-4 w-4 accent-white" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Manage Members</span>
                      <input type="checkbox" checked={perms.workspace?.members} onChange={() => togglePerm("workspace", "members")} className="cursor-pointer h-4 w-4 accent-white" />
                    </div>
                  </div>

                  {/* Group: Events */}
                  <div className="border border-neutral-900 rounded-2xl p-3 space-y-2 mt-2">
                    <span className="font-bold text-white block text-[9px] uppercase tracking-wider">Events Management</span>
                    <div className="flex justify-between items-center">
                      <span>Create Events</span>
                      <input type="checkbox" checked={perms.events?.create} onChange={() => togglePerm("events", "create")} className="cursor-pointer h-4 w-4 accent-white" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Edit Events</span>
                      <input type="checkbox" checked={perms.events?.edit} onChange={() => togglePerm("events", "edit")} className="cursor-pointer h-4 w-4 accent-white" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Delete Events</span>
                      <input type="checkbox" checked={perms.events?.delete} onChange={() => togglePerm("events", "delete")} className="cursor-pointer h-4 w-4 accent-white" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Publish Events</span>
                      <input type="checkbox" checked={perms.events?.publish} onChange={() => togglePerm("events", "publish")} className="cursor-pointer h-4 w-4 accent-white" />
                    </div>
                  </div>

                  {/* Group: Attendees */}
                  <div className="border border-neutral-900 rounded-2xl p-3 space-y-2 mt-2">
                    <span className="font-bold text-white block text-[9px] uppercase tracking-wider">Attendees & Scanners</span>
                    <div className="flex justify-between items-center">
                      <span>View Attendees</span>
                      <input type="checkbox" checked={perms.attendees?.view} onChange={() => togglePerm("attendees", "view")} className="cursor-pointer h-4 w-4 accent-white" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Export Lists</span>
                      <input type="checkbox" checked={perms.attendees?.export} onChange={() => togglePerm("attendees", "export")} className="cursor-pointer h-4 w-4 accent-white" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Entry Check-In</span>
                      <input type="checkbox" checked={perms.attendees?.checkin} onChange={() => togglePerm("attendees", "checkin")} className="cursor-pointer h-4 w-4 accent-white" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Scanner Console Access</span>
                      <input type="checkbox" checked={perms.scanner?.access} onChange={() => togglePerm("scanner", "access")} className="cursor-pointer h-4 w-4 accent-white" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-neutral-900">
                  <Button type="button" onClick={() => { setIsInviteOpen(false); resetInviteForm(); }} className="bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-850 px-4 h-9 rounded-xl cursor-pointer">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-white text-black hover:bg-neutral-200 font-extrabold px-4 h-9 rounded-xl cursor-pointer">
                    Send Workspace Invite
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Permissions Drawer dialog */}
      {isEditPermsOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl w-full max-w-lg space-y-5">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-neutral-400" /> Customize Member Permissions
              </h2>
              <button onClick={() => setIsEditPermsOpen(false)} className="text-neutral-500 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-white text-xs block">{selectedMember.profile.full_name}</span>
              <span className="text-[10px] text-neutral-500 font-bold block">{selectedMember.profile.email}</span>
            </div>

            {/* Same Permissions Matrix switches list */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {/* Group: Workspace */}
              <div className="border border-neutral-900 rounded-2xl p-3 space-y-2">
                <span className="font-bold text-white block text-[9px] uppercase tracking-wider">Workspace Access</span>
                <div className="flex justify-between items-center">
                  <span>Manage Workspace</span>
                  <input type="checkbox" checked={perms.workspace?.manage} onChange={() => togglePerm("workspace", "manage")} className="cursor-pointer h-4 w-4 accent-white" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Workspace Settings</span>
                  <input type="checkbox" checked={perms.workspace?.settings} onChange={() => togglePerm("workspace", "settings")} className="cursor-pointer h-4 w-4 accent-white" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Manage Members</span>
                  <input type="checkbox" checked={perms.workspace?.members} onChange={() => togglePerm("workspace", "members")} className="cursor-pointer h-4 w-4 accent-white" />
                </div>
              </div>

              {/* Group: Events */}
              <div className="border border-neutral-900 rounded-2xl p-3 space-y-2 mt-2">
                <span className="font-bold text-white block text-[9px] uppercase tracking-wider">Events Management</span>
                <div className="flex justify-between items-center">
                  <span>Create Events</span>
                  <input type="checkbox" checked={perms.events?.create} onChange={() => togglePerm("events", "create")} className="cursor-pointer h-4 w-4 accent-white" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Edit Events</span>
                  <input type="checkbox" checked={perms.events?.edit} onChange={() => togglePerm("events", "edit")} className="cursor-pointer h-4 w-4 accent-white" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Delete Events</span>
                  <input type="checkbox" checked={perms.events?.delete} onChange={() => togglePerm("events", "delete")} className="cursor-pointer h-4 w-4 accent-white" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Publish Events</span>
                  <input type="checkbox" checked={perms.events?.publish} onChange={() => togglePerm("events", "publish")} className="cursor-pointer h-4 w-4 accent-white" />
                </div>
              </div>

              {/* Group: Attendees */}
              <div className="border border-neutral-900 rounded-2xl p-3 space-y-2 mt-2">
                <span className="font-bold text-white block text-[9px] uppercase tracking-wider">Attendees & Scanners</span>
                <div className="flex justify-between items-center">
                  <span>View Attendees</span>
                  <input type="checkbox" checked={perms.attendees?.view} onChange={() => togglePerm("attendees", "view")} className="cursor-pointer h-4 w-4 accent-white" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Export Lists</span>
                  <input type="checkbox" checked={perms.attendees?.export} onChange={() => togglePerm("attendees", "export")} className="cursor-pointer h-4 w-4 accent-white" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Entry Check-In</span>
                  <input type="checkbox" checked={perms.attendees?.checkin} onChange={() => togglePerm("attendees", "checkin")} className="cursor-pointer h-4 w-4 accent-white" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Scanner Console Access</span>
                  <input type="checkbox" checked={perms.scanner?.access} onChange={() => togglePerm("scanner", "access")} className="cursor-pointer h-4 w-4 accent-white" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-900">
              <Button type="button" onClick={() => setIsEditPermsOpen(false)} className="bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-850 px-4 h-9 rounded-xl cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleSavePerms} className="bg-white text-black hover:bg-neutral-200 font-extrabold px-4 h-9 rounded-xl cursor-pointer">
                Save Permissions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
