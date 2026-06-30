import { requireWorkspacePermission } from "@/lib/workspace-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { WorkspaceMembersClient } from "./members-client";

export default async function WorkspaceMembersSettingsPage() {
  // Enforce server-side route protection
  const { workspace, member, isOwner } = await requireWorkspacePermission("workspace.members");
  const adminClient = await createAdminClient();

  // Load all current members
  const { data: members } = await adminClient
    .from("organization_members")
    .select(`
      *,
      profile:user_id (
        email,
        full_name,
        avatar_url
      )
    `)
    .eq("organization_id", workspace.id)
    .order("created_at", { ascending: true });

  // Load all pending invitations
  const { data: invitations } = await adminClient
    .from("organization_invitations")
    .select("*")
    .eq("organization_id", workspace.id)
    .order("created_at", { ascending: false });

  // Load all registered users for visual search selector auto-suggestions
  const { data: allUsers } = await adminClient
    .from("profiles")
    .select("id, email, full_name, avatar_url")
    .order("full_name", { ascending: true });

  return (
    <WorkspaceMembersClient
      workspace={workspace}
      currentMemberId={member?.id || ""}
      isOwner={isOwner}
      initialMembers={members || []}
      initialInvitations={invitations || []}
      registeredUsers={allUsers || []}
    />
  );
}
