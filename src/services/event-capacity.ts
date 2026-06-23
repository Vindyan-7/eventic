"use server";

import { createClient } from "@/lib/supabase/server";

export async function getEventCapacity(
    eventId: string
) {
    const supabase =
        await createClient();

    const { data: event } =
        await supabase
            .from("events")
            .select(
                "max_attendees"
            )
            .eq("id", eventId)
            .single();

    const {
        count: registrations,
    } = await supabase
        .from(
            "event_registrations"
        )
        .select("*", {
            count: "exact",
            head: true,
        })
        .eq("event_id", eventId);

    const maxAttendees =
        event?.max_attendees ?? null;

    const currentRegistrations =
        registrations ?? 0;

    const spotsRemaining =
        maxAttendees === null
            ? null
            : Math.max(
                  0,
                  maxAttendees -
                      currentRegistrations
              );

    const isFull =
        maxAttendees !== null &&
        currentRegistrations >=
            maxAttendees;

    return {
        maxAttendees,
        currentRegistrations,
        spotsRemaining,
        isFull,
    };
}