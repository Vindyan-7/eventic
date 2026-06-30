import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { VerificationClient } from "./verification-client";

export default async function AdminVerificationPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "moderator", "viewer"]);

  const adminClient = await createAdminClient();
  
  // Query all organizations awaiting trust status verification
  const { data: orgs, error } = await adminClient
    .from("organizations")
    .select(`
      *,
      owner:owner_id (
        email,
        full_name
      ),
      events (
        id
      )
    `)
    .eq("verification_status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to query pending organizations:", error);
  }

  const formattedOrgs = (orgs || []).map((o: any) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    logo_url: o.logo_url,
    website: o.website,
    description: o.description,
    verification_status: o.verification_status || "pending",
    is_suspended: o.is_suspended || false,
    created_at: o.created_at,
    owner_name: o.owner?.full_name || "Eventic User",
    owner_email: o.owner?.email || "",
    events_count: o.events?.length || 0
  }));

  return <VerificationClient initialOrgs={formattedOrgs} />;
}
