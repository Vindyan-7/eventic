import { createAdminClient } from "@/lib/supabase/server";

/**
 * Inserts a row into admin_audit_logs for security audits.
 * Run in server actions or route handlers.
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  entity: string,
  entityId?: string | null,
  metadata?: any
) {
  try {
    const supabase = await createAdminClient();
    
    let ipAddress = "unknown";
    try {
      const { headers } = await import("next/headers");
      const headerList = await headers();
      ipAddress = headerList.get("x-forwarded-for")?.split(",")[0] || headerList.get("x-real-ip") || "unknown";
    } catch {
      // Bypassed if headers() context is unavailable (e.g. static rendering phase)
    }

    const { error } = await supabase
      .from("admin_audit_logs")
      .insert({
        admin_id: adminId,
        action,
        entity,
        entity_id: entityId || null,
        metadata: metadata || {},
        ip_address: ipAddress
      });

    if (error) {
      console.error("Failed to write admin audit log:", error);
    }
  } catch (err) {
    console.error("Audit logger encountered error:", err);
  }
}
