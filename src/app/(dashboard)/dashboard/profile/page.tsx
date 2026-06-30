import { requireUser } from "@/lib/auth";
import { getCurrentProfile } from "@/services/profile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createAdminClient } from "@/lib/supabase/server";
import { acceptWorkspaceInvitation, declineWorkspaceInvitation } from "@/app/(org)/org/actions";
import { ShieldCheck, Mail, Check, X, Building } from "lucide-react";

export default async function ProfilePage() {
  await requireUser("/dashboard/profile");

  const profile = await getCurrentProfile();

  if (!profile) {
    return <div className="p-10 text-center font-sans text-xs text-neutral-400">Failed to load profile.</div>;
  }

  const adminClient = await createAdminClient();

  // Load active and inactive workspaces memberships
  const { data: memberships } = await adminClient
    .from("organization_members")
    .select(`
      *,
      workspace:organization_id (name, slug)
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  // Load pending invitations
  const { data: invitations } = await adminClient
    .from("organization_invitations")
    .select(`
      *,
      workspace:organization_id (name, slug)
    `)
    .eq("email", profile.email)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  const initials =
    profile.full_name
      ?.split(" ")
      .map((name: string) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  // Server actions wrapper
  const handleAccept = async (formData: FormData) => {
    "use server";
    const inviteId = formData.get("inviteId") as string;
    await acceptWorkspaceInvitation(inviteId);
  };

  const handleDecline = async (formData: FormData) => {
    "use server";
    const inviteId = formData.get("inviteId") as string;
    await declineWorkspaceInvitation(inviteId);
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">My Profile</h1>
        <p className="text-neutral-500 font-bold mt-1 text-[10px] uppercase tracking-wider">View your profile details and workspaces memberships</p>
      </div>

      {/* Avatar details card */}
      <div className="rounded-3xl border border-neutral-900 bg-neutral-900/10 p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <Avatar className="h-20 w-20 border border-neutral-800">
            <AvatarFallback className="text-2xl font-bold bg-neutral-900 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white">
              {profile.full_name ?? "User"}
            </h2>
            <p className="text-neutral-500 font-bold text-[10px]">{profile.email}</p>
            <div className="inline-flex rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 font-bold uppercase text-[9px] tracking-wider">
              {profile.role === "org_admin" ? "Organization Admin" : "User"}
            </div>
          </div>
        </div>
      </div>

      {/* General info */}
      <div className="rounded-3xl border border-neutral-900 bg-neutral-900/10 p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-neutral-900 pb-2">Account Information</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Full Name</p>
            <p className="font-bold text-white mt-1 text-xs">{profile.full_name ?? "-"}</p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Email Address</p>
            <p className="font-mono text-neutral-350 mt-1 text-xs">{profile.email ?? "-"}</p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">System Role</p>
            <p className="font-bold text-white mt-1 text-xs">{profile.role ?? "-"}</p>
          </div>
        </div>
      </div>

      {/* Collaborative workspaces section */}
      <div className="rounded-3xl border border-neutral-900 bg-neutral-900/10 p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-neutral-900 pb-2">My Workspaces</h3>

        {/* Pending Invites list */}
        {invitations && invitations.length > 0 && (
          <div className="space-y-3">
            <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest block">Pending Invites ({invitations.length})</span>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              {invitations.map((invite) => (
                <div key={invite.id} className="border border-amber-900/30 bg-amber-950/5 p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-white block">{(invite.workspace as any)?.name}</span>
                    <span className="text-[9px] text-amber-400/80 font-bold block mt-0.5">Role: {invite.display_title}</span>
                  </div>
                  <div className="flex gap-2">
                    <form action={handleAccept}>
                      <input type="hidden" name="inviteId" value={invite.id} />
                      <button type="submit" className="bg-emerald-650 hover:bg-emerald-700 text-white font-extrabold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer flex items-center gap-1 border border-emerald-600/40">
                        <Check className="h-3.5 w-3.5" /> Accept
                      </button>
                    </form>
                    <form action={handleDecline}>
                      <input type="hidden" name="inviteId" value={invite.id} />
                      <button type="submit" className="bg-red-950/20 hover:bg-red-950/40 text-red-400 font-extrabold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer flex items-center gap-1 border border-red-900/40">
                        <X className="h-3.5 w-3.5" /> Decline
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Memberships table list */}
        {memberships && memberships.length > 0 ? (
          <div className="border border-neutral-900 rounded-2xl overflow-hidden bg-neutral-950/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 text-neutral-500 font-bold uppercase tracking-wider text-[8px] bg-neutral-900/20">
                  <th className="p-3 pl-4">Workspace</th>
                  <th className="p-3">Display Title</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-350">
                {memberships.map((m) => (
                  <tr key={m.id} className="hover:bg-neutral-900/10">
                    <td className="p-3 pl-4 font-bold text-white flex items-center gap-2">
                      <Building className="h-4 w-4 text-neutral-500" />
                      {(m.workspace as any)?.name}
                    </td>
                    <td className="p-3 font-bold flex items-center gap-2">
                      {m.display_title}
                      {m.is_owner && (
                        <span className="bg-emerald-950/40 text-emerald-450 border border-emerald-900/50 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider inline-flex items-center gap-0.5">
                          <ShieldCheck className="h-3 w-3" /> Owner
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                        m.status === "active"
                          ? "bg-emerald-950/10 text-emerald-400 border-emerald-900/40"
                          : "bg-red-950/10 text-red-400 border-red-900/40"
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-500 font-mono text-[10px]">
                      {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 border border-dashed border-neutral-900 rounded-3xl text-center text-neutral-500">
            No workspaces memberships registry found.
          </div>
        )}
      </div>
    </div>
  );
}