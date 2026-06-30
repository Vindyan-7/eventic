import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { UsersClient } from "./users-client";

export default async function AdminUsersPage() {
  // Ensure appropriate permissions clearance
  await requireRole(["super_admin", "platform_admin", "support_admin", "moderator", "viewer"]);

  const adminClient = await createAdminClient();
  const { data: profiles, error } = await adminClient
    .from("profiles")
    .select(`
      *,
      organizations(id),
      event_registrations(id)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to query profiles for admin panel:", error);
  }

  // Format data with relations count
  const formattedProfiles = (profiles || []).map((p: any) => ({
    id: p.id,
    email: p.email,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    role: p.role,
    is_suspended: p.is_suspended || false,
    created_at: p.created_at,
    organizations_count: p.organizations?.length || 0,
    registrations_count: p.event_registrations?.length || 0
  }));

  return <UsersClient initialProfiles={formattedProfiles} />;
}
