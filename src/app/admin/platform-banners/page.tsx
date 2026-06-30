import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { BannersClient } from "./banners-client";

export default async function AdminBannersPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "moderator", "viewer"]);

  const adminClient = await createAdminClient();
  const { data: list, error } = await adminClient
    .from("platform_banners")
    .select("*")
    .order("priority", { ascending: false });

  if (error) {
    console.error("Failed to query banners:", error);
  }

  return <BannersClient initialBanners={list || []} />;
}
