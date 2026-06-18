"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOrganizationAnalytics() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: organization } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!organization) {
        return null;
    }

    const { data: events } = await supabase
        .from("events")
        .select(`
      id,
      is_paid,
      ticket_price,
      event_registrations (
        id
      )
    `)
        .eq("organization_id", organization.id);

    const totalEvents = events?.length || 0;

    const totalRegistrations =
        events?.reduce((acc: any, event: any) => {
            return (
                acc +
                (event.event_registrations?.length || 0)
            );
        }, 0) || 0;

    const totalRevenue =
        events?.reduce((acc: any, event: any) => {
            if (!event.is_paid) return acc;

            return (
                acc +
                (event.ticket_price || 0) *
                (event.event_registrations?.length || 0)
            );
        }, 0) || 0;

    return {
        totalEvents,
        totalRegistrations,
        totalRevenue,
    };
}

export async function getOrganizationEvents() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data: organization } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!organization) {
        return [];
    }

    const { data: events } = await supabase
        .from("events")
        .select(`
      *,
      event_registrations (
        id
      )
    `)
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false });

    return events || [];
}