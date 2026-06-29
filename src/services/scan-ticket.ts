"use server";

import { createClient } from "@/lib/supabase/server";

// Helper to verify that the current authenticated user owns the hosting organization of the event
async function verifyEventOwnership(supabase: any, eventId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (orgError || !organization) {
    return { error: "Organization not found" };
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("organization_id", organization.id)
    .single();

  if (eventError || !event) {
    return { error: "Event not found or access denied" };
  }

  return { success: true };
}

export async function scanTicket(
  registrationId: string,
  eventId: string
) {
  const supabase = await createClient();

  // Verify ownership
  const ownership = await verifyEventOwnership(supabase, eventId);
  if (ownership.error) {
    return { error: ownership.error };
  }

  // Fetch registration details
  const { data, error } = await supabase
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