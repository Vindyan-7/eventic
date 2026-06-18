"use server";

import { createClient } from "@/lib/supabase/server";

export async function registerForEvent(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Please login first",
    };
  }

  const { data: existingRegistration } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingRegistration) {
    return {
      error: "Already registered",
    };
  }

  const { error } = await supabase
    .from("event_registrations")
    .insert({
      event_id: eventId,
      user_id: user.id,
    });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: true,
  };
}