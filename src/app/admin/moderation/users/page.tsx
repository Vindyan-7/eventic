import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { UsersModerationClient } from "./users-moderation-client";

export default async function AdminUsersModerationPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "moderator", "viewer"]);

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
    console.error("Failed to query profiles for moderation:", error);
  }

  const formattedProfiles = (profiles || []).map((p: any) => ({
    id: p.id,
    email: p.email,
    full_name: p.full_name,
    role: p.role,
    is_suspended: p.is_suspended || false,
    suspension_reason: p.suspension_reason || null,
    created_at: p.created_at,
    organizations_count: p.organizations?.length || 0,
    registrations_count: p.event_registrations?.length || 0
  }));

  return <UsersModerationClient initialProfiles={formattedProfiles} />;
}
