import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { AuditClient } from "./audit-client";

export default async function AuditlogsPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "finance_admin", "moderator", "viewer"]);

  const adminClient = await createAdminClient();
  const { data: logs, error } = await adminClient
    .from("admin_audit_logs")
    .select(`
      *,
      admin:admin_id (
        email,
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to query audit logs:", error);
  }

  const formattedLogs = (logs || []).map((l: any) => ({
    id: l.id,
    action: l.action,
    entity: l.entity,
    entity_id: l.entity_id,
    metadata: l.metadata || {},
    ip_address: l.ip_address || "127.0.0.1",
    created_at: l.created_at,
    admin_name: l.admin?.full_name || "Platform Admin",
    admin_email: l.admin?.email || ""
  }));

  return <AuditClient initialLogs={formattedLogs} />;
}
