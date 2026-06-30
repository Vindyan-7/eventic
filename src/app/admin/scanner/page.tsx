import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { ScannerClient } from "./scanner-client";

export default async function AdminScannerPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "support_admin"]);

  const adminClient = await createAdminClient();
  
  // Query all active and expired scanner access codes
  const { data: scanCodes, error } = await adminClient
    .from("event_scan_codes")
    .select(`
      *,
      event:event_id (
        title,
        organization:organization_id (
          name
        )
      )
    `)
    .order("expires_at", { ascending: false });

  if (error) {
    console.error("Failed to query scan codes for admin console:", error);
  }

  // Format scanner codes
  const formattedSessions = (scanCodes || []).map((code: any) => ({
    id: code.id,
    code: code.code,
    expires_at: code.expires_at,
    created_at: code.created_at,
    event_title: code.event?.title || "Unknown Event",
    organization_name: code.event?.organization?.name || "Unknown Org"
  }));

  return <ScannerClient initialSessions={formattedSessions} />;
}
