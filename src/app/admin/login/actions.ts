"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Server action for validating admin login credentials and auth clearance.
 */
export async function adminSignIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication failed." };
  }

  // Verify the user is an active admin user
  const adminClient = await createAdminClient();
  const { data: adminUser, error: adminError } = await adminClient
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (adminError || !adminUser) {
    // If not a registered active admin, revoke token state immediately
    await supabase.auth.signOut();
    return { error: "Access Denied: This account is not authorized as an administrator." };
  }

  return { success: true, redirectTo: "/admin" };
}

/**
 * Server action for signing out admin session
 */
export async function adminSignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true, redirectTo: "/admin/login" };
}
