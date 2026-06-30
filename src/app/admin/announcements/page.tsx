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

  if (error) {
    console.error("Failed to query announcements:", error);
  }

  return <AnnouncementsClient initialAnnouncements={list || []} />;
}
