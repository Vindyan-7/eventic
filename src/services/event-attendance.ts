"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkInAttendee(
    registrationId: string
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "Unauthorized",
        };
    }

    const { data: organization } =
        await supabase
            .from("organizations")
            .select("id")
            .eq("owner_id", user.id)
            .single();

    if (!organization) {
        return {
            error: "Organization not found",
        };
    }

    const { data: registration } =
        await supabase
            .from("event_registrations")
            .select(`
                id,
                checked_in,
                checked_in_at,
                event_id,
                events (
                    organization_id,
                    status,
                    starts_at,
                    ends_at
                )
            `)
            .eq("id", registrationId)
            .single();

    if (!registration) {
        return {
            error: "Registration not found",
        };
    }

    const event = Array.isArray(
        registration.events
    )
        ? registration.events[0]
        : registration.events;

    if (!event) {
        return {
            error: "Event not found",
        };
    }

    if (
        event.status === "cancelled"
    ) {
        return {
            error:
                "Event is cancelled",
        };
    }

    const now =
        new Date();

    const eventEnd =
        event.ends_at
            ? new Date(
                event.ends_at
            )
            : new Date(
                event.starts_at
            );

    if (
        now > eventEnd
    ) {
        return {
            error:
                "Event has already ended",
        };
    }

    if (
        event.organization_id !==
        organization.id
    ) {
        return {
            error: "Access denied",
        };
    }

    // Prevent duplicate scans
    if (registration.checked_in) {
        return {
            error:
                "Attendee already checked in",
        };
    }

    const { error } =
        await supabase
            .from("event_registrations")
            .update({
                checked_in: true,
                checked_in_at:
                    new Date().toISOString(),
            })
            .eq(
                "id",
                registrationId
            );

    if (error) {
        return {
            error: error.message,
        };
    }

    return {
        success: true,
        checkedInAt:
            new Date().toISOString(),
    };
}