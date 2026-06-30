import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { AnnouncementsClient } from "./announcements-client";

export default async function AdminAnnouncementsPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "moderator", "viewer"]);

  const adminClient = await createAdminClient();
  const { data: list, error } = await adminClient
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: orgs } = await adminClient
    .from("organizations")
    .select("id, name")
    .order("name", { ascending: true });

  const { data: events } = await adminClient
    .from("events")
    .select("id, title")
    .order("title", { ascending: true });

  const { data: broadcastLog } = await adminClient
    .from("notification_broadcasts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AnnouncementsClient
      initialAnnouncements={list || []}
      organizations={orgs || []}
      events={events || []}
      initialBroadcasts={broadcastLog || []}
    />
  );
}
