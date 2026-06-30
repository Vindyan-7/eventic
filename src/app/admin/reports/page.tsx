import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { ReportsClient } from "./reports-client";

export default async function AdminReportsPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "moderator", "viewer"]);

  const adminClient = await createAdminClient();
  const { data: reports, error } = await adminClient
    .from("platform_reports")
    .select(`
      *,
      reporter:reporter_id (
        email,
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to query reports:", error);
  }

  const formattedReports = (reports || []).map((r: any) => ({
    id: r.id,
    reported_item_type: r.reported_item_type,
    reported_item_id: r.reported_item_id,
    reporter_name: r.reporter?.full_name || "Eventic User",
    reporter_email: r.reporter?.email || "",
    reason: r.reason,
    description: r.description,
    status: r.status,
    created_at: r.created_at
  }));

  return <ReportsClient initialReports={formattedReports} />;
}
