"use server";

import { createClient } from "@/lib/supabase/server";

export async function getTicket(
    registrationId: string
) {
    const supabase =
        await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const {
        data: registration,
        error,
    } = await supabase
        .from("event_registrations")
        .select(`
            id,
            user_id,
            created_at,
            checked_in,
            checked_in_at,

            profiles!event_registrations_user_id_fkey (
                id,
                full_name,
                email,
                avatar_url
            ),

            events (
                id,
                title,
                slug,
                banner_url,
                venue,
                starts_at,
                ends_at,
                status,
                is_paid,
                ticket_price,

                organizations (
                    name
                )
            )
        `)
        .eq("id", registrationId)
        .single();

    if (error || !registration) {
        return null;
    }

    // Security Check
    if (registration.user_id !== user.id) {
        return null;
    }

    return registration;
}