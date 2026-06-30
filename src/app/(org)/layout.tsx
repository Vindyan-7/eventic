import React from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { getCurrentProfile } from "@/services/profile";
import { logoutAllScanners } from "@/services/scan-code-actions";
import { requireWorkspace } from "@/lib/workspace-auth";
import { WorkspaceProvider } from "./org/workspace-context";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getUserNotifications } from "@/services/notification-service";

export default async function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  const isScanner = profile?.role === "volunteer";

  if (isScanner) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col">
        <header className="border-b bg-background px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Eventic Scanner Portal
            </span>
          </div>
          <form action={logoutAllScanners}>
            <button
              type="submit"
              className="text-sm font-medium hover:underline text-red-500 cursor-pointer"
            >
              Log out Scanner
            </button>
          </form>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    );
  }

  // Check if current user is logged in as a volunteer (Registered or Temporary)
  const cookieStore = await cookies();
  const cookiesList = cookieStore.getAll();
  const hasScanCookie = cookiesList.some((c) => c.name.startsWith("scan_session_"));

  let isVolunteer = hasScanCookie;
  const supabase = await createClient();

  if (profile) {
    // Check if registered volunteer member in organization_members
    const { data: member } = await supabase
      .from("organization_members")
      .select("id, permissions")
      .eq("user_id", profile.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (member) {
      const perms = member.permissions as any;
      if (perms?.scanner?.access === true) {
        isVolunteer = true;
      }
    }
  }

  // If volunteer scanner session, render full screen layout directly
  if (isVolunteer) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white font-sans p-4 md:p-8">
        {children}
      </div>
    );
  }

  // Load active workspace details
  const workspaceDetails = await requireWorkspace();

  // Load all workspaces where the user is an active member or the owner
  const { data: ownedOrgs } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("owner_id", profile?.id || "");

  const { data: memberOrgs } = await supabase
    .from("organization_members")
    .select(`
      organization_id,
      workspace:organization_id (id, name, slug)
    `)
    .eq("user_id", profile?.id || "")
    .eq("status", "active");

  const activeWorkspaces = [
    ...(ownedOrgs || []).map(o => ({ ...o, is_owner: true })),
    ...(memberOrgs || [])
      .filter(m => m.workspace)
      .map(m => ({
        id: (m.workspace as any).id,
        name: (m.workspace as any).name,
        slug: (m.workspace as any).slug,
        is_owner: false
      }))
  ];

  const uniqueWorkspaces = activeWorkspaces.filter(
    (value, index, self) => self.findIndex(t => t.id === value.id) === index
  );

  const notifications = await getUserNotifications();

  return (
    <WorkspaceProvider
      value={{
        ...workspaceDetails,
        activeWorkspaces: uniqueWorkspaces,
      }}
    >
      <AppLayout role="org" profile={profile} initialNotifications={notifications}>
        {children}
      </AppLayout>
    </WorkspaceProvider>
  );
}
