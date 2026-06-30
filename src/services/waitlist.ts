"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification-service";
import { NOTIFICATION_TEMPLATES } from "./notification-templates";

export async function joinEventWaitlist(eventId: string) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to join the waitlist" };

  // Check event details
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
    .from("event_waitlist")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingWaitlist) {
    if (existingWaitlist.status === "waiting" || existingWaitlist.status === "reserved") {
      return { error: "You are already on the waitlist for this event" };
    }
    // Delete old non-active entry to allow re-joining
    await adminClient
      .from("event_waitlist")
      .delete()
      .eq("id", existingWaitlist.id);
  }

  // Determine position
  const { data: maxPosData } = await adminClient
    .from("event_waitlist")
    .select("position")
    .eq("event_id", eventId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (maxPosData?.position ?? 0) + 1;

  const { data: waitlistEntry, error } = await adminClient
    .from("event_waitlist")
    .insert({
      event_id: eventId,
      user_id: user.id,
      position,
      status: "waiting",
      joined_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (error || !waitlistEntry) return { error: error?.message || "Failed to join waitlist" };

  // Create notification
  await createNotification({
    recipientId: user.id,
    ...NOTIFICATION_TEMPLATES.WAITLIST_JOINED(event.title, eventId, position)
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/dashboard/waitlist`);
  return { success: true, position };
}

export async function claimWaitlistTicket(eventId: string) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to claim ticket" };

  // Check waitlist entry
  const { data: waitlist } = await adminClient
    .from("event_waitlist")
    .select("*, event:events(title)")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!waitlist) return { error: "No waitlist entry found" };
  if (waitlist.status !== "reserved") return { error: "Your seat offer is not active" };
  if (new Date(waitlist.reservation_expires_at).getTime() < Date.now()) {
    // Update to expired
    await adminClient
      .from("event_waitlist")
      .update({ status: "expired" })
      .eq("id", waitlist.id);
    await processSeatRelease(eventId);
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
    .from("event_waitlist")
    .update({
      status: "claimed",
      claimed_at: new Date().toISOString()
    })
    .eq("id", waitlist.id);

  // Send notification
  const waitlistEventTitle = (waitlist?.event as any)?.title || "the event";
  await createNotification({
    recipientId: user.id,
    type: "TICKET_CLAIMED",
    category: "Waitlist",
    title: "Ticket Claimed! 🎉",
    message: `You have successfully claimed your ticket reservation for "${waitlistEventTitle}".`,
    icon: "CalendarCheck",
    color: "text-blue-500",
    priority: "normal",
    actionUrl: "/dashboard/tickets",
    eventId: eventId,
  });

  revalidatePath(`/dashboard/events`);
  revalidatePath(`/dashboard/waitlist`);
  revalidatePath(`/events/${eventId}`);
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

  const { count: activeOffers } = await adminClient
    .from("event_waitlist")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "reserved")
    .gt("reservation_expires_at", new Date().toISOString());

  const currentRegs = regCount ?? 0;
  const spotsAvailable = event.max_attendees - (currentRegs + (activeOffers ?? 0));

  if (spotsAvailable <= 0) return;

  // 2. Select next people in queue
  const { data: nextQueue } = await adminClient
    .from("event_waitlist")
    .select("id, user_id, position")
    .eq("event_id", eventId)
    .eq("status", "waiting")
    .order("position", { ascending: true })
    .limit(spotsAvailable);

  if (!nextQueue || nextQueue.length === 0) return;

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 60 minutes

  for (const item of nextQueue) {
    // Offer seat
    await adminClient
      .from("event_waitlist")
      .update({
        status: "reserved",
        reservation_created_at: new Date().toISOString(),
        reservation_expires_at: expiresAt
      })
      .eq("id", item.id);

    // Create notification
    await createNotification({
      recipientId: item.user_id,
      ...NOTIFICATION_TEMPLATES.SEAT_AVAILABLE(event.title, eventId)
    });

    console.log(`[WAITLIST Cron] Seat offered to User ${item.user_id} for ${event.title}`);
  }
}

export async function processExpiredReservations() {
  const adminClient = await createAdminClient();
  const now = new Date().toISOString();

  // Find all reserved waitlists that are expired
  const { data: expiredList } = await adminClient
    .from("event_waitlist")
    .select("id, event_id, user_id, event:events(title)")
    .eq("status", "reserved")
    .lt("reservation_expires_at", now);

  if (!expiredList || expiredList.length === 0) return;

  const eventIdsToProcess = new Set<string>();

  for (const item of expiredList) {
    // Set to expired
    await adminClient
      .from("event_waitlist")
      .update({ status: "expired" })
      .eq("id", item.id);

    eventIdsToProcess.add(item.event_id);

    // Create notification
    const eventTitle = (item.event as any)?.title || "the event";
    await createNotification({
      recipientId: item.user_id,
      ...NOTIFICATION_TEMPLATES.SEAT_EXPIRED(eventTitle, item.event_id)
    });
  }

  // Trigger seat release
  for (const eventId of eventIdsToProcess) {
    await processSeatRelease(eventId);
  }
}

export async function getUserWaitlists() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("event_waitlist")
    .select(`
      *,
      event:event_id (
        id,
        title,
        starts_at,
        slug,
        organizations (
          name
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function getEventWaitlist(eventId: string) {
  const adminClient = await createAdminClient();
  const { data, error } = await adminClient
    .from("event_waitlist")
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

export async function promoteWaitlistUser(waitlistId: string) {
  const adminClient = await createAdminClient();

  const { data: waitlist } = await adminClient
    .from("event_waitlist")
    .select("event_id, user_id, event:events(title)")
    .eq("id", waitlistId)
    .single();

  if (!waitlist) return { error: "Entry not found" };

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await adminClient
    .from("event_waitlist")
    .update({
      status: "reserved",
      reservation_created_at: new Date().toISOString(),
      reservation_expires_at: expiresAt
    })
    .eq("id", waitlistId);

  // Send notification
  const promotedEventTitle = (waitlist.event as any)?.title || "the event";
  await createNotification({
    recipientId: waitlist.user_id,
    ...NOTIFICATION_TEMPLATES.SEAT_AVAILABLE(promotedEventTitle, waitlist.event_id)
  });

  revalidatePath(`/org/events/${waitlist.event_id}/waitlist`);
  return { success: true };
}

export async function skipWaitlistUser(waitlistId: string) {
  const adminClient = await createAdminClient();

  const { data: waitlist } = await adminClient
    .from("event_waitlist")
    .select("event_id, status")
    .eq("id", waitlistId)
    .single();

  if (!waitlist) return { error: "Entry not found" };

  await adminClient
    .from("event_waitlist")
    .update({ status: "skipped" })
    .eq("id", waitlistId);

  // If skipped user held a seat reservation, trigger promotion for the next person
  if (waitlist.status === "reserved") {
    await processSeatRelease(waitlist.event_id);
  }

  revalidatePath(`/org/events/${waitlist.event_id}/waitlist`);
  return { success: true };
}

export async function removeWaitlistUser(waitlistId: string) {
  const adminClient = await createAdminClient();

  const { data: waitlist } = await adminClient
    .from("event_waitlist")
    .select("event_id, status")
    .eq("id", waitlistId)
    .single();

  if (!waitlist) return { error: "Entry not found" };

  await adminClient
    .from("event_waitlist")
    .delete()
    .eq("id", waitlistId);

  if (waitlist.status === "reserved") {
    await processSeatRelease(waitlist.event_id);
  }

  revalidatePath(`/org/events/${waitlist.event_id}/waitlist`);
  return { success: true };
}

export async function leaveWaitlist(waitlistId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: waitlist } = await supabase
    .from("event_waitlist")
    .select("event_id, status, user_id")
    .eq("id", waitlistId)
    .single();

  if (!waitlist) return { error: "Waitlist entry not found" };
  if (waitlist.user_id !== user.id) return { error: "Access denied" };

  await supabase
    .from("event_waitlist")
    .update({ status: "cancelled" })
    .eq("id", waitlistId);

  if (waitlist.status === "reserved") {
    const adminClient = await createAdminClient();
    await processSeatRelease(waitlist.event_id);
  }

  revalidatePath(`/dashboard/waitlist`);
  return { success: true };
}

export async function getWaitlistAnalytics(eventId: string) {
  const adminClient = await createAdminClient();

  const { data: list } = await adminClient
    .from("event_waitlist")
    .select("*")
    .eq("event_id", eventId);

  if (!list || list.length === 0) {
    return {
      averageWaitMinutes: 0,
      totalWaitlisted: 0,
      seatsReclaimed: 0,
      conversionRate: 0,
      missedReservations: 0,
    };
  }

  let totalWaitTimeMs = 0;
  let waitCount = 0;
  let seatsReclaimed = 0;
  let missedReservations = 0;

  for (const item of list) {
    if (item.status === "claimed") {
      seatsReclaimed++;
    }
    if (item.status === "expired") {
      missedReservations++;
    }

    const end = item.claimed_at || item.reservation_created_at || null;
    if (end && item.joined_at) {
      const waitTime = new Date(end).getTime() - new Date(item.joined_at).getTime();
      totalWaitTimeMs += Math.max(0, waitTime);
      waitCount++;
    }
  }

  const averageWaitMinutes = waitCount > 0 ? Math.round(totalWaitTimeMs / (1000 * 60 * waitCount)) : 0;
  const totalWaitlisted = list.length;
  const conversionRate = totalWaitlisted > 0 ? Math.round((seatsReclaimed / totalWaitlisted) * 100) : 0;

  return {
    averageWaitMinutes,
    totalWaitlisted,
    seatsReclaimed,
    conversionRate,
    missedReservations,
  };
}
