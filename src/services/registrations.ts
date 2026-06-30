"use server";

import { createClient } from "@/lib/supabase/server";

export async function registerForEvent(
    eventId: string,
    customAnswers?: Record<string, string>
) {
    const supabase =
        await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            error:
                "Please login first",
        };
    }

    const { data: event } =
        await supabase
            .from("events")
            .select(
                "id,max_attendees"
            )
            .eq("id", eventId)
            .single();

    if (!event) {
        return {
            error:
                "Event not found",
        };
    }

    const {
        count: registrationCount,
    } = await supabase
        .from(
            "event_registrations"
        )
        .select("*", {
            count: "exact",
            head: true,
        })
        .eq("event_id", eventId);

    if (
        event.max_attendees &&
        (registrationCount ?? 0) >=
            event.max_attendees
    ) {
        return {
            error:
                "Event is full",
            isFull: true,
        };
    }

    const {
        data:
            existingRegistration,
    } = await supabase
        .from(
            "event_registrations"
        )
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (
        existingRegistration
    ) {
        return {
            error:
                "Already registered",
        };
    }

    const { data: newReg, error } =
        await supabase
            .from(
                "event_registrations"
            )
            .insert({
                event_id: eventId,
                user_id: user.id,
                custom_answers: customAnswers || {},
            })
            .select("id")
            .single();

    if (error || !newReg) {
        return {
            error:
                error?.message || "Failed to create registration",
        };
    }

    return {
        success: true,
        registrationId: newReg.id,
    };
}