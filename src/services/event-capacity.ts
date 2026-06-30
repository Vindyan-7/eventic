"use server";

import { createClient } from "@/lib/supabase/server";

export async function getEventCapacity(eventId: string) {
    const supabase = await createClient();

    const { data: event } = await supabase
        .from("events")
        .select("max_attendees")
        .eq("id", eventId)
        .single();

    const { count: registrations } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId);

    const { count: waitlistCount } = await supabase
        .from("event_waitlist")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)
        .in("status", ["waiting", "reserved"]);

    const maxAttendees = event?.max_attendees ?? null;
    const currentRegistrations = registrations ?? 0;

    const spotsRemaining =
        maxAttendees === null
            ? null
            : Math.max(0, maxAttendees - currentRegistrations);

    const isFull = maxAttendees !== null && currentRegistrations >= maxAttendees;

    const capacityPercentage =
        maxAttendees === null || maxAttendees === 0
            ? 0
            : Math.round((currentRegistrations / maxAttendees) * 100);

    let registrationStatus: "Open" | "Almost Full" | "Full" = "Open";
    if (isFull) {
        registrationStatus = "Full";
    } else if (maxAttendees !== null) {
        const threshold = Math.max(1, Math.round(maxAttendees * 0.1));
        if (spotsRemaining !== null && spotsRemaining <= threshold) {
            registrationStatus = "Almost Full";
        }
    }

    const waitlisted = waitlistCount ?? 0;
    const estimatedWaitVal = waitlisted * 10;
    const estimatedWait =
        waitlisted === 0
            ? "No wait"
            : estimatedWaitVal < 60
            ? `~${estimatedWaitVal} mins`
            : `~${Math.round(estimatedWaitVal / 60)} hours`;

    return {
        maxAttendees,
        currentRegistrations,
        spotsRemaining,
        isFull,
        waitlistCount: waitlisted,
        estimatedWait,
        capacityPercentage,
        registrationStatus,
    };
}