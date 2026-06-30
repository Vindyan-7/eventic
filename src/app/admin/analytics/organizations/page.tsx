import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { OrgsAnalyticsClient } from "./orgs-analytics-client";

export default async function AdminOrgsAnalyticsPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "finance_admin", "viewer"]);

  const adminClient = await createAdminClient();

  const { data: orgs, error } = await adminClient
    .from("organizations")
    .select(`
      *,
      events (
        id,
        registrations_count
      )
    `);

  if (error) {
    console.error("Failed to query organizations for analytics:", error);
  }

  const formattedOrgs = (orgs || []).map((o: any) => ({
    id: o.id,
    name: o.name,
    verification_status: o.verification_status || "pending",
    created_at: o.created_at,
    events: o.events || []
  }));

  return <OrgsAnalyticsClient orgs={formattedOrgs} />;
}
