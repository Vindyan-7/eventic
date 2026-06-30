import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminsClient } from "./admins-client";

export default async function AdminAdminsPage() {
  // Ensure access clearance (only super_admin and platform_admin can view this list)
  const currentAdmin = await requireRole(["super_admin", "platform_admin"]);

  const adminClient = await createAdminClient();
  
  // Query all console administrators, joining their profile references
  const { data: admins, error } = await adminClient
    .from("admin_users")
    .select(`
      *,
      profile:user_id (
        email,
        full_name,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to query admin users list:", error);
  }

  // Format data
  const formattedAdmins = (admins || []).map((admin: any) => ({
    id: admin.id,
    user_id: admin.user_id,
    role: admin.role,
    is_active: admin.is_active,
    created_at: admin.created_at,
    last_login_at: admin.last_login_at || null,
    email: admin.profile?.email || "",
    full_name: admin.profile?.full_name || "Eventic Administrator",
    avatar_url: admin.profile?.avatar_url || null
  }));

  return (
    <AdminsClient
      initialAdmins={formattedAdmins}
      currentAdmin={currentAdmin}
    />
  );
}
