"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { validateScanSession } from "@/services/scan-code-actions";

// Helper to verify that the current authenticated user owns the hosting organization of the event
async function verifyEventOwnership(supabase: any, eventId: string) {
  // 1. Check for staff scanner session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(`scan_session_${eventId}`);
  if (sessionCookie) {
    const code = sessionCookie.value;
    const isValid = await validateScanSession(eventId, code);
    if (isValid) {
      return { success: true };
    }
  }

  // 2. Fall back to organization administrator checks
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
  const adminSupabase = await createAdminClient();

  // Verify ownership
  const ownership = await verifyEventOwnership(supabase, eventId);
  if (ownership.error) {
    return { error: ownership.error };
  }

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