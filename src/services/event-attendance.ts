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
                event_id,
                events (
                    organization_id
                )
            `)
            .eq("id", registrationId)
            .single();


    if (!registration) {
        return {
            error: "Registration not found",
        };
    }

    const event =
        registration.events as {
            organization_id: string;
        } | null;

    if (!event) {
        return {
            error: "Event not found",
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
    };
}