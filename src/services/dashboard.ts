"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardData() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: profile } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

    const { data: registrations } =
        await supabase
            .from("event_registrations")
            .select(`
                id,
                checked_in,
                created_at,

                events (
    id,
    title,
    description,
    venue,
    banner_url,
    starts_at,
    ends_at,
    is_paid,
    ticket_price,
    status,
    slug,
    organizations (
        name,
        logo_url
    )
),

payments (
    id,
    status
)
            `)
            .eq("user_id", user.id)
            .order("created_at", {
                ascending: false,
            });

    const now = new Date();

    const upcomingEvents =
        registrations?.filter(
            (r: any) =>
                r.events &&
                new Date(
                    r.events.starts_at
                ) > now
        ) ?? [];

    const checkedInEvents =
        registrations?.filter(
            (r: any) =>
                r.checked_in
        ) ?? [];

    const paidEvents =
        registrations?.filter(
            (r: any) =>
                r.payments?.[0]
                    ?.status === "paid"
        ) ?? [];

    return {
        profile,
        registrations:
            registrations ?? [],
        stats: {
            totalRegistrations:
                registrations?.length ??
                0,

            upcomingEvents:
                upcomingEvents.length,

            checkedInEvents:
                checkedInEvents.length,

            paidEvents:
                paidEvents.length,
        },
    };
}

export async function getUserRegisteredEvents() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data: registrations } = await supabase
        .from("event_registrations")
        .select(`
            id,
            checked_in,
            checked_in_at,
            created_at,

            events (
    id,
    title,
    description,
    venue,
    banner_url,
    starts_at,
    ends_at,
    is_paid,
    ticket_price,
    status,
    slug,
    organizations (
        name,
        logo_url
    )
),

payments (
    id,
    status
)
        `)
        .eq("user_id", user.id);

    return registrations ?? [];
}