import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { TicketsClient } from "./tickets-client";

export default async function AdminTicketsPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "support_admin"]);

  const adminClient = await createAdminClient();
  
  // Query all event registrations with details
  const { data: regs, error } = await adminClient
    .from("event_registrations")
    .select(`
      *,
      profile:user_id (
        email,
        full_name
      ),
      event:event_id (
        title,
        organization:organization_id (
          name
        )
      ),
      payments (
        amount,
        status
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to query registrations for tickets page:", error);
  }

  // Format registrations into ticket records
  const formattedTickets = (regs || []).map((r: any) => ({
    id: r.id,
    ticket_number: r.ticket_number,
    created_at: r.created_at,
    attendee_name: r.profile?.full_name || "Eventic User",
    attendee_email: r.profile?.email || "",
    event_title: r.event?.title || "Unknown Event",
    organization_name: r.event?.organization?.name || "Unknown Org",
    payment_status: r.payments?.[0]?.status || "free",
    amount: r.payments?.[0]?.amount || 0
  }));

  return <TicketsClient initialTickets={formattedTickets} />;
}
