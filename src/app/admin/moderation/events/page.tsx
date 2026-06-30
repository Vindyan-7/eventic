import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { EventsModerationClient } from "./events-moderation-client";

export default async function AdminEventsModerationPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "moderator", "viewer"]);

  const adminClient = await createAdminClient();
  const { data: events, error } = await adminClient
    .from("events")
    .select(`
      *,
      organization:organization_id (
        name
      ),
      event_registrations (
        id
      )
    `)
    .order("starts_at", { ascending: false });

  if (error) {
    console.error("Failed to query events for moderation:", error);
  }

  const formattedEvents = (events || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    venue: e.venue,
    starts_at: e.starts_at,
    status: e.status,
    is_hidden: e.is_hidden || false,
    moderation_reason: e.moderation_reason || null,
    organization_name: e.organization?.name || "Unknown Org",
    registrations_count: e.event_registrations?.length || 0
  }));

  return <EventsModerationClient initialEvents={formattedEvents} />;
}
