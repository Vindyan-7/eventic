import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { ScannersAnalyticsClient } from "./scanners-analytics-client";

export default async function AdminScannersAnalyticsPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "finance_admin", "viewer"]);

  const adminClient = await createAdminClient();

  // Query checkin keys and scan logs to track gate control productivity
  const { data: scanCodes, error: scanError } = await adminClient
    .from("event_scan_codes")
    .select(`
      *,
      event:event_id (
        title
      )
    `);

  const { data: checkins, error: checkinError } = await adminClient
    .from("event_registrations")
    .select("id, checked_in_at, scanned_by")
    .not("checked_in_at", "is", null);

  if (scanError || checkinError) {
    console.error("Failed to query scanners for analytics:", { scanError, checkinError });
  }

  return <ScannersAnalyticsClient scanCodes={scanCodes || []} checkins={checkins || []} />;
}
