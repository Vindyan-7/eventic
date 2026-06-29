"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  const supabase = await createClient();

  // Check for staff scanner session cookie
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const scanCookie = allCookies.find((c) => c.name.startsWith("scan_session_"));
  
  if (scanCookie) {
    const eventId = scanCookie.name.replace("scan_session_", "");
    const code = scanCookie.value;
    
    const { data: record } = await supabase
      .from("event_scan_codes")
      .select("id, expires_at")
      .eq("event_id", eventId)
      .eq("code", code)
      .maybeSingle();

    if (record && new Date(record.expires_at).getTime() > Date.now()) {
      const { data: event } = await supabase
        .from("events")
        .select("title")
        .eq("id", eventId)
        .maybeSingle();

      const eventPrefix = event?.title 
        ? event.title.replace(/[^a-zA-Z0-9]/g, "").substring(0, 5).toLowerCase()
        : "staff";

      return {
        id: `scanner_${eventId}`,
        full_name: `${event?.title ? event.title.substring(0, 15) : "Event"} Scanner`,
        email: `${eventPrefix}@eventic.local`,
        role: "volunteer",
        event_id: eventId,
      };
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}