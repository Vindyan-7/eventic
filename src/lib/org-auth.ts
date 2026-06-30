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

  if (profile?.role !== "org_admin" && profile?.role !== "super_admin") {
    redirect("/dashboard");
  }

  return user;
}

export async function hasWorkspaceScannerAccess(eventId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const supabase = await createClient();

  // 1. Check for staff scanner session cookie (Temporary Volunteer Access Code)
  const sessionCookie = cookieStore.get(`scan_session_${eventId}`);
  if (sessionCookie) {
    const code = sessionCookie.value;
    const isValid = await validateScanSession(eventId, code);
    if (isValid) {
      return true;
    }
  }

  // 2. Check for logged-in user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Load event organization
  const { data: event } = await supabase
    .from("events")
    .select("organization_id")
    .eq("id", eventId)
    .maybeSingle();

  if (!event) return false;

  // Check if Owner of organization
  const { data: ownedOrg } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", event.organization_id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (ownedOrg) return true;

  // Check if Member with scanner.access permission
  const { data: member } = await supabase
    .from("organization_members")
    .select("id, permissions, status")
    .eq("organization_id", event.organization_id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (member) {
    const perms = member.permissions as any;
    if (perms?.scanner?.access === true) {
      return true;
    }
  }

  return false;
}

export async function requireOrgAdminOrScanner(eventId: string) {
  const hasAccess = await hasWorkspaceScannerAccess(eventId);
  if (hasAccess) {
    // Determine the type of scanner
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(`scan_session_${eventId}`);
    if (sessionCookie) {
      return { isScanner: true, type: "temporary", code: sessionCookie.value };
    }
    
    // Logged in user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return { user, isScanner: true, type: user ? "registered" : "owner" };
  }

  // Fall back to standard organization admin validation
  const orgUser = await requireOrgAdmin();
  return { user: orgUser, isScanner: false, type: "owner" };
}