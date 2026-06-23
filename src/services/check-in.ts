"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkInRegistration(
    registrationId: string
) {
    const supabase =
        await createClient();

    const {
        data: registration,
        error,
    } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("id", registrationId)
        .single();

    if (error || !registration) {
        return {
            success: false,
            message: "Invalid ticket",
        };
    }

    if (
        registration.checked_in
    ) {
        return {
            success: false,
            message:
                "Already checked in",
        };
    }

    const {
        error: updateError,
    } = await supabase
        .from(
            "event_registrations"
        )
        .update({
            checked_in: true,
            checked_in_at:
                new Date().toISOString(),
        })
        .eq(
            "id",
            registrationId
        );

    if (updateError) {
        return {
            success: false,
            message:
                updateError.message,
        };
    }

    return {
        success: true,
        message:
            "Check-in successful",
    };
}