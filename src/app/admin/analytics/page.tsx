import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "finance_admin", "viewer"]);

  const adminClient = await createAdminClient();

  // Query events along with registrations and checkins to build category distributions
  const { data: events, error } = await adminClient
    .from("events")
    .select(`
      *,
      organization:organization_id (
        name
      ),
      event_registrations (
        id,
        created_at,
        checked_in_at
      )
    `);

  if (error) {
    console.error("Failed to query events for analytics summary:", error);
  }

  const formattedEvents = (events || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    category: e.category || "General",
    status: e.status,
    venue: e.venue || "TBD",
    starts_at: e.starts_at,
    is_featured: e.is_featured || false,
    organization_name: e.organization?.name || "Unknown Org",
    registrations: e.event_registrations || []
  }));

  return <AnalyticsClient events={formattedEvents} />;
}
