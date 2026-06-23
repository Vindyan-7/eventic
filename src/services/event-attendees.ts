"use server";

import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";


// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface EventAttendee {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    registered_at: string;
    registration_id: string;
    checked_in: boolean;
    checked_in_at: string | null;
    payment_status: string;
}

type GetEventAttendeesResult =
    | { data: EventAttendee[]; error: null }
    | { data: null; error: string };

// ─────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────

export async function getEventAttendees(
    eventId: string
): Promise<GetEventAttendeesResult> {
    noStore();
    const supabase = await createClient();


    // Verify authentication
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            data: null,
            error: "Unauthorized",
        };
    }

    // Verify organization ownership
    const { data: organization, error: orgError } =
        await supabase
            .from("organizations")
            .select("id")
            .eq("owner_id", user.id)
            .single();

    if (orgError || !organization) {
        return {
            data: null,
            error: "Organization not found",
        };
    }

    // Verify event belongs to organization
    const { data: event, error: eventError } =
        await supabase
            .from("events")
            .select("id")
            .eq("id", eventId)
            .eq("organization_id", organization.id)
            .single();

    if (eventError || !event) {
        return {
            data: null,
            error: "Event not found or access denied",
        };
    }

    // Fetch attendees
    const {
        data: registrations,
        error: regError,
    } = await supabase
        .from("event_registrations")
        .select(`
    id,
    created_at,
    checked_in,
    checked_in_at,
    profiles!event_registrations_user_id_fkey (
        id,
        full_name,
        email,
        avatar_url
    ),
    payments (
        status
    )
`)
        .eq("event_id", eventId)
        .order("created_at", {
            ascending: true,
        });

    if (regError) {
        return {
            data: null,
            error: regError.message,
        };
    }

    const attendees: EventAttendee[] =
        (registrations ?? [])
            .filter(
                (reg) =>
                    reg.profiles !== null
            )
            .map((reg) => {
                const profile =
                    reg.profiles as unknown as {
                        id: string;
                        full_name: string | null;
                        email: string;
                        avatar_url: string | null;
                    };

                const payment =
    Array.isArray(reg.payments)
        ? reg.payments[0]
        : null;

return {
    id: profile.id,
    full_name:
        profile.full_name,
    email: profile.email,
    avatar_url:
        profile.avatar_url,
    registered_at:
        reg.created_at,
    registration_id:
        reg.id,
    checked_in:
        Boolean(reg.checked_in),
    checked_in_at:
        reg.checked_in_at,
    payment_status:
        payment?.status ?? "free",
};
            });

    return {
        data: attendees,
        error: null,
    };
}