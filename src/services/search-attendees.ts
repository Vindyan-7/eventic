"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { validateScanSession } from "@/services/scan-code-actions";

export interface SearchAttendeeResult {
    id: string; // registration_id
    created_at: string;
    checked_in: boolean;
    checked_in_at: string | null;
    user_id: string;
    ticket_number: string;
    profiles: {
        id: string;
        full_name: string | null;
        email: string;
        avatar_url: string | null;
    } | null;
    [key: string]: any;
}

// Verify that the current user owns the organization hosting the event
async function verifyEventOwnership(supabase: any, eventId: string) {
    // 1. Check for staff scanner session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(`scan_session_${eventId}`);
    if (sessionCookie) {
        const code = sessionCookie.value;
        const isValid = await validateScanSession(eventId, code);
        if (isValid) {
            return { success: true };
        }
    }

    // 2. Fall back to organization administrator checks
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Unauthorized" };
    }

    const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (orgError || !organization) {
        return { error: "Organization not found" };
    }

    const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id")
        .eq("id", eventId)
        .eq("organization_id", organization.id)
        .single();

    if (eventError || !event) {
        return { error: "Event not found or access denied" };
    }

    return { success: true };
}

export async function searchAttendees(
    eventId: string,
    searchQuery: string
): Promise<{ data: SearchAttendeeResult[] | null; totalMatches: number; error: string | null }> {
    const supabase = await createAdminClient();

    // 1. Verify ownership and event correlation
    const ownership = await verifyEventOwnership(supabase, eventId);
    if (ownership.error) {
        return { data: null, totalMatches: 0, error: ownership.error };
    }

    const query = searchQuery.trim().toLowerCase();
    if (query.length < 2) {
        return { data: [], totalMatches: 0, error: null };
    }

    // 2. Query all registrations for the event
    const { data: registrations, error: regError } = await supabase
        .from("event_registrations")
        .select(`
            *,
            profiles!event_registrations_user_id_fkey (
                id,
                full_name,
                email,
                avatar_url
            )
        `)
        .eq("event_id", eventId);

    if (regError) {
        return { data: null, totalMatches: 0, error: regError.message };
    }

    if (!registrations) {
        return { data: [], totalMatches: 0, error: null };
    }

    // 3. Filter registrations in memory
    const matches = (registrations as any[])
        .filter((reg) => reg.profiles !== null)
        .filter((reg) => {
            const profile = Array.isArray(reg.profiles) ? reg.profiles[0] : reg.profiles;
            if (!profile) return false;

            const fullName = (profile.full_name || "").toLowerCase();
            const email = (profile.email || "").toLowerCase();
            const regId = (reg.id || "").toLowerCase();
            const last4RegId = regId.slice(-4);
            const ticketNum = (reg.ticket_number || "").toLowerCase();

            // Name checks (full or partial)
            const matchesName = fullName.includes(query);

            // Email checks (full or partial)
            const matchesEmail = email.includes(query);

            // Registration ID checks (UUID or last 4 characters)
            const matchesRegId = regId === query || last4RegId === query || regId.includes(query);

            // Ticket number checks (full, suffix, or last 4 digits)
            const last4TicketNum = ticketNum.slice(-4);
            const matchesTicketNum = ticketNum.includes(query) || last4TicketNum === query;

            // Support any future textual or numeric fields dynamically
            let matchesFutureField = false;
            for (const key of Object.keys(reg)) {
                if (
                    !["id", "event_id", "user_id", "created_at", "checked_in", "checked_in_at", "profiles", "ticket_number"].includes(key)
                ) {
                    const val = reg[key];
                    if (typeof val === "string" && val.toLowerCase().includes(query)) {
                        matchesFutureField = true;
                        break;
                    } else if (typeof val === "number" && String(val).includes(query)) {
                        matchesFutureField = true;
                        break;
                    }
                }
            }

            return matchesName || matchesEmail || matchesRegId || matchesTicketNum || matchesFutureField;
        });

    return {
        data: matches.slice(0, 10),
        totalMatches: matches.length,
        error: null,
    };
}
