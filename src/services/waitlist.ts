"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function joinEventWaitlist(eventId: string) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to join the waitlist" };

  // Check event title
  const { data: event } = await adminClient
    .from("events")
    .select("title")
    .eq("id", eventId)
    .single();

  if (!event) return { error: "Event not found" };

  // Check if already registered
  const { data: existingReg } = await adminClient
    .from("event_registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingReg) return { error: "You are already registered for this event" };

  // Check if already on waitlist
  const { data: existingWaitlist } = await adminClient
    .from("event_waitlists")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingWaitlist) {
    if (existingWaitlist.status === "waiting" || existingWaitlist.status === "offered") {
      return { error: "You are already on the waitlist for this event" };
    }
    // Delete expired/claimed waitlist entry to re-join
    await adminClient
      .from("event_waitlists")
      .delete()
      .eq("id", existingWaitlist.id);
  }

  // Determine waitlist position
  const { data: maxPosData } = await adminClient
    .from("event_waitlists")
    .select("position")
    .eq("event_id", eventId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (maxPosData?.position ?? 0) + 1;

  const { data: waitlistEntry, error } = await adminClient
    .from("event_waitlists")
    .insert({
      event_id: eventId,
      user_id: user.id,
      position,
      status: "waiting"
    })
    .select("id")
    .single();

  if (error || !waitlistEntry) return { error: error?.message || "Failed to join waitlist" };

  // Create notification
  await adminClient
    .from("notifications")
    .insert({
      user_id: user.id,
      title: "Joined Waitlist",
      message: `You have successfully joined the waitlist for "${event.title}". Your current position is #${position}.`,
      type: "WAITLIST_JOINED",
      event_id: eventId
    });

  revalidatePath(`/events/${eventId}`);
  return { success: true, position };
}

export async function claimWaitlistTicket(eventId: string) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to claim ticket" };

  // Check waitlist entry
  const { data: waitlist } = await adminClient
    .from("event_waitlists")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!waitlist) return { error: "No waitlist entry found" };
  if (waitlist.status !== "offered") return { error: "Your seat offer is not active" };
  if (new Date(waitlist.expires_at).getTime() < Date.now()) {
    // Update to expired
    await adminClient
      .from("event_waitlists")
      .update({ status: "expired" })
      .eq("id", waitlist.id);
    return { error: "Your claim reservation has expired" };
  }

  // Perform confirmed registration
  const { data: newReg, error: regError } = await adminClient
    .from("event_registrations")
    .insert({
      event_id: eventId,
      user_id: user.id
    })
    .select("id")
    .single();

  if (regError || !newReg) return { error: regError?.message || "Failed to confirm registration" };

  // Update waitlist entry to claimed
  await adminClient
    .from("event_waitlists")
    .update({ status: "claimed" })
    .eq("id", waitlist.id);

  // Send notification
  await adminClient
    .from("notifications")
    .insert({
      user_id: user.id,
      title: "Ticket Claimed!",
      message: "You have successfully claimed your ticket reservation. See you at the event!",
      type: "TICKET_CLAIMED",
      event_id: eventId
    });

  revalidatePath(`/dashboard/events`);
  return { success: true };
}

export async function processSeatRelease(eventId: string) {
  const adminClient = await createAdminClient();

  // 1. Get capacity details
  const { data: event } = await adminClient
    .from("events")
    .select("max_attendees, title")
    .eq("id", eventId)
    .single();

  if (!event || !event.max_attendees) return;

  const { count: regCount } = await adminClient
    .from("event_registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  const currentRegs = regCount ?? 0;
  const spotsAvailable = event.max_attendees - currentRegs;

  if (spotsAvailable <= 0) return;

  // 2. Find waitlisted people who are offered but haven't expired or claimed
  const { count: activeOffers } = await adminClient
    .from("event_waitlists")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "offered")
    .gt("expires_at", new Date().toISOString());

  const remainingOffersToMake = spotsAvailable - (activeOffers ?? 0);
  if (remainingOffersToMake <= 0) return;

  // 3. Select next people in queue
  const { data: nextQueue } = await adminClient
    .from("event_waitlists")
    .select("id, user_id, position")
    .eq("event_id", eventId)
    .eq("status", "waiting")
    .order("position", { ascending: true })
    .limit(remainingOffersToMake);

  if (!nextQueue || nextQueue.length === 0) return;

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 60 minutes

  for (const item of nextQueue) {
    // Offer seat
    await adminClient
      .from("event_waitlists")
      .update({
        status: "offered",
        offered_at: new Date().toISOString(),
        expires_at: expiresAt
      })
      .eq("id", item.id);

    // Create website notification
    await adminClient
      .from("notifications")
      .insert({
        user_id: item.user_id,
        title: "Seat Reserved!",
        message: `A seat is available for "${event.title}"! You have 60 minutes to claim your ticket before it expires.`,
        type: "SEAT_RESERVED",
        event_id: eventId
      });

    // Simulated email log output
    console.log(`[SIMULATED EMAIL] To: UserID ${item.user_id} - Seat Available for event "${event.title}". Expiring at ${expiresAt}`);
  }
}

export async function processExpiredReservations() {
  const adminClient = await createAdminClient();
  const now = new Date().toISOString();

  // Find all offered waitlists that are expired
  const { data: expiredList } = await adminClient
    .from("event_waitlists")
    .select("id, event_id, user_id")
    .eq("status", "offered")
    .lt("expires_at", now);

  if (!expiredList || expiredList.length === 0) return;

  const eventIdsToProcess = new Set<string>();

  for (const item of expiredList) {
    // Set to expired
    await adminClient
      .from("event_waitlists")
      .update({ status: "expired" })
      .eq("id", item.id);

    eventIdsToProcess.add(item.event_id);

    // Create notifications for expiration
    await adminClient
      .from("notifications")
      .insert({
        user_id: item.user_id,
        title: "Reservation Expired",
        message: "Your 60-minute ticket claim reservation has expired and the seat has been offered to the next student in queue.",
        type: "RESERVATION_EXPIRED",
        event_id: item.event_id
      });
  }

  // Trigger seat release for affected events
  for (const eventId of eventIdsToProcess) {
    await processSeatRelease(eventId);
  }
}

// User Dashboard waitlists list
export async function getUserWaitlists() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("event_waitlists")
    .select(`
      *,
      event:event_id (
        id,
        title,
        starts_at,
        slug
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

// Organizer Dashboard waitlist list
export async function getEventWaitlist(eventId: string) {
  const adminClient = await createAdminClient();
  const { data, error } = await adminClient
    .from("event_waitlists")
    .select(`
      *,
      profile:user_id (
        full_name,
        email
      )
    `)
    .eq("event_id", eventId)
    .order("position", { ascending: true });

  if (error || !data) return [];
  return data;
}

// Organizer Waitlist Actions
export async function promoteWaitlistUser(waitlistId: string) {
  const adminClient = await createAdminClient();
  
  const { data: waitlist } = await adminClient
    .from("event_waitlists")
    .select("event_id, user_id")
    .eq("id", waitlistId)
    .single();

  if (!waitlist) return { error: "Entry not found" };

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await adminClient
    .from("event_waitlists")
    .update({
      status: "offered",
      offered_at: new Date().toISOString(),
      expires_at: expiresAt
    })
    .eq("id", waitlistId);

  // Send notification
  await adminClient
    .from("notifications")
    .insert({
      user_id: waitlist.user_id,
      title: "Seat Offered!",
      message: "You have been promoted on the waitlist! You have 60 minutes to claim your ticket.",
      type: "SEAT_RESERVED",
      event_id: waitlist.event_id
    });

  return { success: true };
}

export async function removeWaitlistUser(waitlistId: string) {
  const adminClient = await createAdminClient();
  const { error } = await adminClient
    .from("event_waitlists")
    .delete()
    .eq("id", waitlistId);

  if (error) return { error: error.message };
  return { success: true };
}
