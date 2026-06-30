import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireOrgAdmin } from "./org-auth";

export interface WorkspacePermission {
  workspace?: { manage?: boolean; settings?: boolean; members?: boolean };
  events?: { create?: boolean; edit?: boolean; delete?: boolean; publish?: boolean };
  attendees?: { view?: boolean; export?: boolean; checkin?: boolean };
  analytics?: { view?: boolean };
  scanner?: { access?: boolean };
  certificates?: { manage?: boolean };
  finance?: { billing?: boolean; payouts?: boolean };
}

export interface WorkspaceDetails {
  workspace: {
    id: string;
    name: string;
    slug: string;
    owner_id: string;
    description?: string;
    logo_url?: string;
    website?: string;
  };
  member: {
    id: string;
    display_title: string;
    permissions: WorkspacePermission;
    status: string;
    is_owner: boolean;
  } | null;
  isOwner: boolean;
  permissions: WorkspacePermission;
}

// Global default full permissions for Owners
export const OWNER_PERMISSIONS: WorkspacePermission = {
  workspace: { manage: true, settings: true, members: true },
  events: { create: true, edit: true, delete: true, publish: true },
  attendees: { view: true, export: true, checkin: true },
  analytics: { view: true },
  scanner: { access: true },
  certificates: { manage: true },
  finance: { billing: true, payouts: true }
};

/**
 * Server-side helper to resolve the active workspace and permissions for the current user.
 */
export async function requireWorkspace(): Promise<WorkspaceDetails> {
  const user = await requireOrgAdmin();
  const supabase = await createClient();
  const cookieStore = await cookies();
  
  // Get active workspace ID from cookie
  const activeWorkspaceId = cookieStore.get("eventic_active_workspace")?.value;

  let workspace = null;
  let isOwner = false;
  let memberRecord = null;

  // 1. If we have a cookie, try loading that specific workspace
  if (activeWorkspaceId) {
    // Check if user is the Owner of this workspace
    const { data: ownedOrg } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", activeWorkspaceId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (ownedOrg) {
      workspace = ownedOrg;
      isOwner = true;
    } else {
      // Check if user is an active Member of this workspace
      const { data: member } = await supabase
        .from("organization_members")
        .select(`
          *,
          workspace:organization_id (*)
        `)
        .eq("organization_id", activeWorkspaceId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (member && member.workspace) {
        workspace = member.workspace;
        memberRecord = member;
        isOwner = member.is_owner;
      }
    }
  }

  // 2. If no workspace resolved yet, fall back to any active workspace memberships or owned organizations
  if (!workspace) {
    // Check owned organizations first
    const { data: ownedOrg } = await supabase
      .from("organizations")
      .select("*")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle();

    if (ownedOrg) {
      workspace = ownedOrg;
      isOwner = true;
    } else {
      // Check active memberships
      const { data: member } = await supabase
        .from("organization_members")
        .select(`
          *,
          workspace:organization_id (*)
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (member && member.workspace) {
        workspace = member.workspace;
        memberRecord = member;
        isOwner = member.is_owner;
      }
    }
  }

  // 3. If still no workspace resolved, redirect user to workspace creation portal
  if (!workspace) {
    redirect("/org/create");
  }

  // Define active permissions
  const permissions: WorkspacePermission = isOwner
    ? OWNER_PERMISSIONS
    : (memberRecord?.permissions as WorkspacePermission) || {};

  return {
    workspace: workspace as any,
    member: memberRecord
      ? {
          id: memberRecord.id,
          display_title: memberRecord.display_title,
          permissions: memberRecord.permissions as WorkspacePermission,
          status: memberRecord.status,
          is_owner: memberRecord.is_owner,
        }
      : null,
    isOwner,
    permissions,
  };
}

/**
 * Asserts the current user has the required permission path.
 * Super Admins and Workspace Owners always pass.
 */
export async function requireWorkspacePermission(permissionPath: string): Promise<WorkspaceDetails> {
  const details = await requireWorkspace();

  if (details.isOwner) {
    return details;
  }

  // Split path, e.g., "events.create" -> ["events", "create"]
  const parts = permissionPath.split(".");
  if (parts.length === 2) {
    const group = parts[0] as keyof WorkspacePermission;
    const action = parts[1];
    
    const groupObj = details.permissions[group] as any;
    if (groupObj && groupObj[action] === true) {
      return details;
    }
  }

  // If unauthorized, redirect to access denied page
  redirect("/org/unauthorized");
}
