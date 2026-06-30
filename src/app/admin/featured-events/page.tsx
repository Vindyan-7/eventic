import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { FeaturedClient } from "./featured-client";

export default async function AdminFeaturedEventsPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "moderator", "viewer"]);

  const adminClient = await createAdminClient();
  
  // Query all published fests to allow featuring and arranging
  const { data: events, error } = await adminClient
    .from("events")
    .select(`
      *,
      organization:organization_id (
        name
      )
    `)
    .eq("status", "published")
    .order("featured_order", { ascending: true });

  if (error) {
    console.error("Failed to query events for featuring:", error);
  }

  const formattedEvents = (events || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    is_featured: e.is_featured || false,
    is_pinned: e.is_pinned || false,
    featured_order: e.featured_order || 0,
    organization_name: e.organization?.name || "Unknown Org"
  }));

  return <FeaturedClient initialEvents={formattedEvents} />;
}
