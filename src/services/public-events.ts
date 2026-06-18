import { createClient } from "@/lib/supabase/server";

export async function getPublishedEvents() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      organizations (
        name,
        slug,
        logo_url
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

export async function getEventBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      organizations (
        name,
        slug,
        logo_url
      )
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    return null;
  }

  return data;
}