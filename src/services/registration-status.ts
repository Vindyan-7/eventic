"use server";

import { createClient } from "@/lib/supabase/server";

export async function isRegistered(
    eventId: string
): Promise<string | null> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();

    return data?.id || null;
}