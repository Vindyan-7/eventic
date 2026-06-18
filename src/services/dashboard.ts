"use server";

import { createClient } from "@/lib/supabase/server";

export async function getUserRegisteredEvents() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from("event_registrations")
        .select(`
            id,
            created_at,
            checked_in,
            checked_in_at,

            events (
                id,
                title,
                slug,
                description,
                venue,
                starts_at,
                is_paid,
                ticket_price
            ),

            payments (
                id,
                status,
                amount
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
}