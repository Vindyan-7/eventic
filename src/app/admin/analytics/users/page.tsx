import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { UsersAnalyticsClient } from "./users-analytics-client";

export default async function AdminUsersAnalyticsPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "finance_admin", "viewer"]);

  const adminClient = await createAdminClient();

  // Query users and registration activity to calculate returning attendee metrics
  const { data: users, error } = await adminClient
    .from("profiles")
    .select(`
      id,
      created_at,
      email,
      full_name,
      event_registrations (
        id,
        created_at
      )
    `);

  if (error) {
    console.error("Failed to query user records for analytics:", error);
  }

  const formattedUsers = (users || []).map((u: any) => ({
    id: u.id,
    created_at: u.created_at,
    email: u.email,
    full_name: u.full_name || "Eventic User",
    registrations: u.event_registrations || []
  }));

  return <UsersAnalyticsClient users={formattedUsers} />;
}
