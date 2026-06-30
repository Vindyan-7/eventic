"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireWorkspace, requireWorkspacePermission, WorkspacePermission } from "@/lib/workspace-auth";

/**
 * Searches users inside profiles table by email.
 */
export async function searchUsersByEmail(email: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url")
    .eq("email", email)
    .maybeSingle();

  if (error) return null;
  return data;
}

/**
 * Invites a user to a workspace.
 */
export async function inviteWorkspaceMember(data: {
  email: string;
  displayTitle: string;
  permissions: WorkspacePermission;
}) {
  const { workspace } = await requireWorkspacePermission("workspace.members");
  const adminClient = await createAdminClient();

  // Search if user exists
  const user = await searchUsersByEmail(data.email);
  if (!user) {
    throw new Error(
      "This email is not registered in Eventic. Ask the user to create an Eventic account first."
    );
  }

  // Generate invitation token
  const token = "wsi_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { error } = await adminClient
    .from("organization_invitations")
    .insert({
      organization_id: workspace.id,
      email: data.email,
      display_title: data.displayTitle,
      permissions: data.permissions,
      invited_by: (await adminClient.auth.getUser()).data.user?.id,
      token,
      expires_at: expiresAt.toISOString(),
    });

  if (error) throw new Error(error.message);

  revalidatePath("/org/settings/members");
  return { success: true };
}

/**
 * Revokes a pending workspace invitation.
 */
export async function revokeWorkspaceInvitation(invitationId: string) {
  const { workspace } = await requireWorkspacePermission("workspace.members");
  const adminClient = await createAdminClient();

  const { error } = await adminClient
    .from("organization_invitations")
    .delete()
    .eq("id", invitationId)
    .eq("organization_id", workspace.id);

  if (error) throw new Error(error.message);

  revalidatePath("/org/settings/members");
  return { success: true };
}

/**
 * Deactivates or Reactivates a member workspace access.
 */
export async function updateMemberStatus(memberId: string, status: "active" | "inactive") {
  const { workspace, member } = await requireWorkspacePermission("workspace.members");
  const adminClient = await createAdminClient();

  // Ensure Owner is not modifying themselves
  const { data: targetMember } = await adminClient
    .from("organization_members")
    .select("is_owner")
    .eq("id", memberId)
    .single();

  if (targetMember?.is_owner) {
    throw new Error("You cannot deactivate or modify the workspace Owner.");
  }

  const { error } = await adminClient
    .from("organization_members")
    .update({ status })
    .eq("id", memberId)
    .eq("organization_id", workspace.id);

  if (error) throw new Error(error.message);

  revalidatePath("/org/settings/members");
  return { success: true };
}

/**
 * Modifies permissions schema assigned to a member.
 */
export async function updateMemberPermissions(memberId: string, permissions: WorkspacePermission) {
  const { workspace } = await requireWorkspacePermission("workspace.members");
  const adminClient = await createAdminClient();

  const { data: targetMember } = await adminClient
    .from("organization_members")
    .select("is_owner")
    .eq("id", memberId)
    .single();

  if (targetMember?.is_owner) {
    throw new Error("Permissions for the Owner cannot be customized; they are always full.");
  }

  const { error } = await adminClient
    .from("organization_members")
    .update({ permissions })
    .eq("id", memberId)
    .eq("organization_id", workspace.id);

  if (error) throw new Error(error.message);

  revalidatePath("/org/settings/members");
  return { success: true };
}

/**
 * Accept Workspace Invitation flow.
 */
export async function acceptWorkspaceInvitation(invitationId: string) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Load invitation
  const { data: invitation, error: inviteError } = await adminClient
    .from("organization_invitations")
    .select("*")
    .eq("id", invitationId)
    .single();

  if (inviteError || !invitation) throw new Error("Invitation not found");

  // Check expiration
  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    throw new Error("Invitation has expired.");
  }

  // Insert into organization_members
  const { error: insertError } = await adminClient
    .from("organization_members")
    .insert({
      organization_id: invitation.organization_id,
      user_id: user.id,
      display_title: invitation.display_title,
      permissions: invitation.permissions,
      status: "active",
      joined_at: new Date().toISOString(),
    });

  if (insertError) throw new Error(insertError.message);

  // Update accepted timestamp
  await adminClient
    .from("organization_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitationId);

  revalidatePath("/dashboard/profile");
  return { success: true };
}

/**
 * Decline Workspace Invitation flow.
 */
export async function declineWorkspaceInvitation(invitationId: string) {
  const adminClient = await createAdminClient();

  const { error } = await adminClient
    .from("organization_invitations")
    .delete()
    .eq("id", invitationId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/profile");
  return { success: true };
}

/**
 * Logs volunteer activity to organization_activity_logs table.
 */
export async function logVolunteerActivity(data: {
  eventId: string;
  actionType: "LOGIN" | "LOGOUT" | "OFFLINE_START" | "OFFLINE_END" | "QUEUE_SYNC" | "MANUAL_CHECKIN" | "QR_CHECKIN" | "FAILED_SYNC";
  details?: any;
}) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: event } = await adminClient
    .from("events")
    .select("organization_id")
    .eq("id", data.eventId)
    .maybeSingle();

  if (!event) return { error: "Event not found" };

  let tempCode = null;
  if (!user) {
    const cookiesList = await import("next/headers").then(m => m.cookies());
    tempCode = cookiesList.get(`scan_session_${data.eventId}`)?.value || null;
  }

  const { error } = await adminClient
    .from("organization_activity_logs")
    .insert({
      organization_id: event.organization_id,
      event_id: data.eventId,
      user_id: user ? user.id : null,
      temporary_volunteer_code: tempCode,
      action_type: data.actionType,
      details: data.details || {},
    });

  if (error) {
    console.error("Activity logging error:", error.message);
    return { error: error.message };
  }

  return { success: true };
}

