"use server";

import { createClient } from "@/lib/supabase/server";

export async function getPublishedEvents() {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("events")
      .select(`
                *,
                organizations (
    name,
    slug,
    logo_url,
    description,
    website
),
                event_registrations (
                    id
                )
            `)
      .eq("status", "published")
      .order("starts_at", {
        ascending: true,
      });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getEventBySlug(
  slug: string
) {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("events")
      .select(`
                *,
                organizations (
    name,
    slug,
    logo_url,
    description,
    website
),
                event_registrations (
                    id
                )
            `)
      .eq("slug", slug)
      .eq("status", "published")
      .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getPublicEventStats() {
  const events = await getPublishedEvents();

  const now = new Date();

  const upcoming = events.filter(
    (event: any) => new Date(event.starts_at) > now
  );

  const live = events.filter((event: any) => {
    const start = new Date(event.starts_at);

    const end = event.ends_at ? new Date(event.ends_at) : start;

    return start <= now && end >= now;
  });

  const completed = events.filter((event: any) => {
    const end = event.ends_at
      ? new Date(event.ends_at)
      : new Date(event.starts_at);

    return end < now;
  });

  return {
    total: events.length,
    upcoming: upcoming.length,
    live: live.length,
    completed: completed.length,
  };
}