import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import { cookies } from "next/headers";
import { validateScanSession } from "@/services/scan-code-actions";

export async function requireOrgAdmin(redirectPath?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const target = redirectPath
      ? `/login?redirect=${encodeURIComponent(redirectPath)}`
      : "/login";
    redirect(target);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "org_admin") {
    redirect("/dashboard");
  }

  return user;
}

export async function requireOrgAdminOrScanner(eventId: string) {
  // 1. Check for staff scanner session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(`scan_session_${eventId}`);
  
  if (sessionCookie) {
    const code = sessionCookie.value;
    const isValid = await validateScanSession(eventId, code);
    if (isValid) {
      return { isScanner: true };
    }
  }

  // 2. Fall back to organization administrator checks
  const user = await requireOrgAdmin();
  return { user, isScanner: false };
}