"use server";

import { createClient } from "@/lib/supabase/server";

export interface OrgEventDetail {
    id: string;
    organization_id: string;
    title: string;
    slug: string;
    description: string | null;
    banner_url: string | null;
    venue: string | null;
    starts_at: string;
    ends_at: string | null;
    max_attendees: number | null;
    is_paid: boolean;
    ticket_price: number;
    status: "draft" | "published" | "completed" | "cancelled";
    created_at: string;
    updated_at: string;
    registration_count: number;
}

type GetOrganizationEventResult =
    | { data: OrgEventDetail; error: null }
    | { data: null; error: string };

export async function getOrganizationEvent(
    eventId: string
): Promise<GetOrganizationEventResult> {
    const supabase = await createClient();

    // 1. Verify authentication
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "Unauthorized" };
    }

    // 2. Verify the current user owns an organization
    const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (orgError || !organization) {
        return { data: null, error: "Organization not found" };
    }

    // 3. Fetch the event, verifying it belongs to this organization
    const { data: event, error: eventError } = await supabase
        .from("events")
        .select(`
            id,
            organization_id,
            title,
            slug,
            description,
            banner_url,
            venue,
            starts_at,
            ends_at,
            max_attendees,
            is_paid,
            ticket_price,
            status,
            created_at,
            updated_at,
            event_registrations ( id )
        `)
        .eq("id", eventId)
        .eq("organization_id", organization.id)
        .single();

    if (eventError || !event) {
        return { data: null, error: "Event not found or access denied" };
    }

    // 4. Shape the result — count registrations from the joined rows
    const registrations = event.event_registrations as { id: string }[] | null;
    const registration_count = registrations?.length ?? 0;

    const { event_registrations: _, ...eventFields } = event as typeof event & {
        event_registrations: unknown;
    };

    return {
        data: {
            ...eventFields,
            ticket_price: Number(eventFields.ticket_price ?? 0),
            registration_count,
        },
        error: null,
    };
}
