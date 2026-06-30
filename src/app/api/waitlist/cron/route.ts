import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { processExpiredReservations, processSeatRelease } from "@/services/waitlist";
import { createNotification } from "@/services/notification-service";

export async function GET(request: Request) {
  try {
    const adminClient = await createAdminClient();
    const now = new Date().toISOString();

    // 1. Process Expired Reservations
    await processExpiredReservations();

    // 2. Send 15-Minute Warnings
    const fifteenMinsFromNow = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    // Find reservations expiring in under 15 minutes that are still active
    const { data: expiringSoon } = await adminClient
      .from("event_waitlist")
      .select("id, event_id, user_id, reservation_expires_at, event:events(title)")
      .eq("status", "reserved")
      .gt("reservation_expires_at", now)
      .lt("reservation_expires_at", fifteenMinsFromNow);

    if (expiringSoon && expiringSoon.length > 0) {
      for (const item of expiringSoon) {
        // Check if warning was already sent to avoid duplicate notifications
        const { data: existingWarning } = await adminClient
          .from("notifications")
          .select("id")
          .eq("recipient_id", item.user_id)
          .eq("event_id", item.event_id)
          .eq("type", "SEAT_EXPIRING")
          .maybeSingle();

        if (!existingWarning) {
          const eventTitle = (item.event as any)?.title || "the event";
          const expiresTime = new Date(item.reservation_expires_at).toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit"
          });

          await createNotification({
            recipientId: item.user_id,
            type: "SEAT_EXPIRING",
            category: "Waitlist",
            title: "Reservation Expiring Soon! ⏰",
            message: `Your seat reservation for "${eventTitle}" expires at ${expiresTime}. Claim it now!`,
            icon: "Clock",
            color: "text-orange-500",
            priority: "high",
            actionUrl: "/dashboard/waitlist",
            eventId: item.event_id,
            sendEmail: true,
            emailSubject: `⏰ Action Required: Seat reservation for ${eventTitle} expiring soon`,
            emailHtml: `<p>Your seat reservation for <strong>${eventTitle}</strong> is expiring soon at ${expiresTime}. Please claim your ticket on your dashboard before it is offered to the next student.</p>`
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Waitlist reservation engine executed successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to execute reservation engine" }, { status: 500 });
  }
}
