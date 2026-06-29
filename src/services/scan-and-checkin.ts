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

export async function scanAndCheckIn(
  registrationId: string,
  eventId: string
) {
  const supabase = await createClient();

  // 1. Verify ownership of the event
  const ownership = await verifyEventOwnership(supabase, eventId);
  if (ownership.error) {
    return { error: ownership.error };
  }

  // 2. Validate QR / Fetch registration details
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

  // 3. Validate event correlation
  if (!event || event.id !== eventId) {
    return { error: "Ticket belongs to another event" };
  }

  // 4. If already checked in, return alreadyCheckedIn: true
  if (data.checked_in) {
    return {
      success: true,
      attendee: data,
      checkedIn: true,
      checkedInAt: data.checked_in_at,
      alreadyCheckedIn: true,
    };
  }

  // 5. Otherwise, check attendee in (update the db table)
  const checkInTime = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("event_registrations")
    .update({
      checked_in: true,
      checked_in_at: checkInTime,
    })
    .eq("id", registrationId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Fetch updated attendee details
  const { data: updatedData, error: fetchError } = await supabase
    .from("event_registrations")
    .select(`
      id,
      created_at,
      checked_in,
      checked_in_at,
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

  if (fetchError || !updatedData) {
    return { error: "Failed to fetch updated attendee info" };
  }

  return {
    success: true,
    attendee: updatedData,
    checkedIn: true,
    checkedInAt: checkInTime,
    alreadyCheckedIn: false,
  };
}
