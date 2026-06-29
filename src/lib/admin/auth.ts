import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AdminRole = 'super_admin' | 'platform_admin' | 'support_admin' | 'finance_admin' | 'moderator' | 'viewer';

export interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  email?: string;
  full_name?: string;
}

/**
 * Validates that the current user has a valid active admin account.
 * Redirects to /admin/login if not authenticated, or / if not an admin.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const adminClient = await createAdminClient();
  const { data: adminUser, error } = await adminClient
    .from("admin_users")
    .select(`
      *,
      profile:user_id (
        email,
        full_name
      )
    `)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (error || !adminUser) {
    // If authenticated but not an admin, sign out or redirect to home
    redirect("/");
  }

  return {
    ...adminUser,
    email: (adminUser as any).profile?.email,
    full_name: (adminUser as any).profile?.full_name,
  };
}

/**
 * Asserts that the active admin has one of the allowed roles.
 * Super Admins always bypass this check.
 */
export async function requireRole(allowedRoles: AdminRole | AdminRole[]): Promise<AdminUser> {
  const admin = await requireAdmin();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (admin.role === "super_admin") {
    return admin;
  }

  if (!roles.includes(admin.role)) {
    redirect("/admin/unauthorized");
  }

  return admin;
}
