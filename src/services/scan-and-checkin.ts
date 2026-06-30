"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasWorkspaceScannerAccess } from "@/lib/org-auth";
import { logVolunteerActivity } from "@/app/(org)/org/actions";

async function verifyEventOwnership(eventId: string) {
  const hasAccess = await hasWorkspaceScannerAccess(eventId);
  if (!hasAccess) {
    return { error: "Unauthorized" };
  }
  return { success: true };
}

export async function scanAndCheckIn(
  registrationId: string,
  eventId: string,
  isManual: boolean = false
) {
  // 1. Verify ownership of the event
  const ownership = await verifyEventOwnership(eventId);
  if (ownership.error) {
    return { error: ownership.error };
  }

  const adminSupabase = await createAdminClient();

  // 2. Validate QR / Fetch registration details
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
  const { error: updateError } = await adminSupabase
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
  const { data: updatedData, error: fetchError } = await adminSupabase
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

  // Log activity
  const profile = Array.isArray(updatedData.profiles) ? updatedData.profiles[0] : updatedData.profiles;
  await logVolunteerActivity({
    eventId,
    actionType: isManual ? "MANUAL_CHECKIN" : "QR_CHECKIN",
    details: {
      registrationId,
      ticketNumber: data.ticket_number,
      attendeeName: profile?.full_name || "Unknown Attendee",
    },
  });

  return {
    success: true,
    attendee: updatedData,
    checkedIn: true,
    checkedInAt: checkInTime,
    alreadyCheckedIn: false,
  };
}
