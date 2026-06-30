import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { EventsClient } from "./events-client";

export default async function AdminEventsPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "moderator", "viewer"]);

  const adminClient = await createAdminClient();
  
  // Query all events, including organizations and registrations details
  const { data: events, error } = await adminClient
    .from("events")
    .select(`
      *,
      organization:organization_id (
        name,
        slug
      ),
      event_registrations (
        id,
        payments (
          amount,
          status
        )
      )
    `)
    .order("starts_at", { ascending: false });

  if (error) {
    console.error("Failed to query events for admin:", error);
  }

  // Format events adding aggregates
  const formattedEvents = (events || []).map((e: any) => {
    let totalRevenue = 0;
    (e.event_registrations || []).forEach((r: any) => {
      (r.payments || []).forEach((p: any) => {
        if (p.status === "paid") {
          totalRevenue += Number(p.amount);
        }
      });
    });

    return {
      id: e.id,
      title: e.title,
      slug: e.slug,
      venue: e.venue,
      starts_at: e.starts_at,
      ends_at: e.ends_at,
      max_attendees: e.max_attendees,
      is_paid: e.is_paid,
      ticket_price: e.ticket_price,
      status: e.status,
      created_at: e.created_at,
      is_featured: e.is_featured || false,
      organization_name: e.organization?.name || "Unknown Org",
      registrations_count: e.event_registrations?.length || 0,
      revenue: totalRevenue
    };
  });

  return <EventsClient initialEvents={formattedEvents} />;
}
