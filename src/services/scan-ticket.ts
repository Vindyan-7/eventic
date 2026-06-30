"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasWorkspaceScannerAccess } from "@/lib/org-auth";

async function verifyEventOwnership(eventId: string) {
  const hasAccess = await hasWorkspaceScannerAccess(eventId);
  if (!hasAccess) {
    return { error: "Unauthorized" };
  }
  return { success: true };
}

export async function scanTicket(
  registrationId: string,
  eventId: string
) {
  // Verify ownership
  const ownership = await verifyEventOwnership(eventId);
  if (ownership.error) {
    return { error: ownership.error };
  }

  const adminSupabase = await createAdminClient();

  // Fetch registration details
  const { data, error } = await adminSupabase
    .from("event_registrations")
    .select(`
      id,
      created_at,
      checked_in,
      checked_in_at,
      ticket_number,
      profiles!event_registrations_user_id_fkey (
        full_name,
        email
      ),
      events (
        id,
        title
      )
    `)
    .eq("id", registrationId)
    .single();

  if (error || !data) {
    return { error: "Ticket not found" };
  }

  const event = Array.isArray(data.events) ? data.events[0] : data.events;

  if (!event || event.id !== eventId) {
    return { error: "Ticket belongs to another event" };
  }

  return {
    success: true,
    attendee: data,
    checkedIn: data.checked_in,
    checkedInAt: data.checked_in_at,
    alreadyCheckedIn: data.checked_in,
  };
}