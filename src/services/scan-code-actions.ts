"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Helper to generate a random 6-digit number suffix
function generateCodeString(): string {
    const num = Math.floor(100000 + Math.random() * 900000);
    return `${num}`;
}

// 1. Generate a temporary scanner access code valid for 24 hours
export async function generateScanCode(eventId: string) {
    const supabase = await createClient();

    // Verify organization ownership
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    const { data: organization } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!organization) {
        return { error: "Organization not found" };
    }

    const { data: event } = await supabase
        .from("events")
        .select("id")
        .eq("id", eventId)
        .eq("organization_id", organization.id)
        .single();

    if (!event) {
        return { error: "Event not found or access denied" };
    }

    // Generate unique code
    let code = generateCodeString();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
        const { data } = await supabase
            .from("event_scan_codes")
            .select("id")
            .eq("code", code)
            .maybeSingle();

        if (!data) {
            isUnique = true;
        } else {
            code = generateCodeString();
            attempts++;
        }
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

    // Remove any existing codes for this event to avoid clutter
    await supabase.from("event_scan_codes").delete().eq("event_id", eventId);

    // Insert new scan code
    const { error } = await supabase.from("event_scan_codes").insert({
        event_id: eventId,
        code,
        expires_at: expiresAt,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true, code, expiresAt };
}

// 2. Validate the scanner access code submitted by staff and set cookie session
export async function validateScanCode(code: string) {
    const supabase = await createClient();

    // Search for code in DB
    const { data: record, error } = await supabase
        .from("event_scan_codes")
        .select("event_id, expires_at")
        .eq("code", code.trim())
        .maybeSingle();

    if (error || !record) {
        return { error: "Invalid access code" };
    }

    // Check expiration
    if (new Date(record.expires_at).getTime() < Date.now()) {
        // Delete expired record
        await supabase.from("event_scan_codes").delete().eq("code", code.trim());
        return { error: "Access code has expired" };
    }

    // Set secure cookie for 24 hours
    const cookieStore = await cookies();
    cookieStore.set(`scan_session_${record.event_id}`, code.trim(), {
        maxAge: 24 * 60 * 60, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });

    return { success: true, eventId: record.event_id };
}

// 3. Helper to validate if a scan session is active
export async function validateScanSession(eventId: string, code: string): Promise<boolean> {
    const supabase = await createClient();

    const { data: record } = await supabase
        .from("event_scan_codes")
        .select("id, expires_at")
        .eq("event_id", eventId)
        .eq("code", code)
        .maybeSingle();

    if (!record) return false;

    // Verify it is not expired
    return new Date(record.expires_at).getTime() > Date.now();
}

// 4. Fetch active scan code for an event (for display to the organizer)
export async function getActiveScanCode(eventId: string) {
    const supabase = await createClient();

    const { data: record } = await supabase
        .from("event_scan_codes")
        .select("code, expires_at")
        .eq("event_id", eventId)
        .maybeSingle();

    if (!record) return null;

    if (new Date(record.expires_at).getTime() < Date.now()) {
        return null;
    }

    return record;
}
