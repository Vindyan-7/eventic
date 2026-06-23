"use server";

import { createClient } from "@/lib/supabase/server";

export async function scanTicket(
    registrationId: string,
    eventId: string
) {
    const supabase =
        await createClient();

    const { data, error } =
        await supabase
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

    if (error || !data) {
        return {
            error:
                "Ticket not found",
        };
    }

    const event =
        Array.isArray(data.events)
            ? data.events[0]
            : data.events;

    if (
        event.id !== eventId
    ) {
        return {
            error:
                "Ticket belongs to another event",
        };
    }

    return {
        success: true,
        attendee: data,
    };
}