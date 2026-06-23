"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOrganizationBySlug(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        return null;
    }
    return data;
}

export async function getOrganizationEvents(organizationId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("events")
        .select(`
            *,
            organizations (
                name,
                slug,
                logo_url
            ),
            event_registrations (
                id
            )
        `)
        .eq("organization_id", organizationId)
        .neq("status", "draft")
        .order("starts_at", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export async function getOrganizationStats(organizationId: string) {
    const events = await getOrganizationEvents(organizationId);

    const now = new Date();
    let totalRegistrations = 0;
    let upcomingCount = 0;
    let completedCount = 0;

    events.forEach((event: any) => {
        totalRegistrations += event.event_registrations?.length ?? 0;
        const startsAt = new Date(event.starts_at);
        const endsAt = event.ends_at ? new Date(event.ends_at) : startsAt;

        if (startsAt > now) {
            upcomingCount++;
        } else if (endsAt < now || event.status === "completed") {
            completedCount++;
        }
    });

    return {
        totalEvents: events.length,
        totalRegistrations,
        upcomingEvents: upcomingCount,
        completedEvents: completedCount,
    };
}
