import { requireWorkspacePermission } from "@/lib/workspace-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { VolunteersMonitorClient } from "./volunteers-monitor-client";

export default async function VolunteersMonitorPage() {
  const { workspace, isOwner } = await requireWorkspacePermission("workspace.members");
  const adminClient = await createAdminClient();

  // 1. Fetch Registered Volunteers (Workspace Members with scanner.access permission)
  const { data: members } = await adminClient
    .from("organization_members")
    .select(`
      id,
      display_title,
      permissions,
      status,
      last_active_at,
      profile:user_id (
        full_name,
        email
      )
    `)
    .eq("organization_id", workspace.id);

  const registeredVolunteers = (members || [])
    .filter((m: any) => {
      const perms = m.permissions as any;
      return perms?.scanner?.access === true;
    })
    .map((m: any) => ({
      id: m.id,
      name: m.profile?.full_name || "Registered Volunteer",
      email: m.profile?.email,
      status: m.status,
      lastActive: m.last_active_at,
      type: "Registered"
    }));

  // 2. Fetch Active Temporary Access Codes
  // Find all events in this organization and get active codes
  const { data: events } = await adminClient
    .from("events")
    .select("id, title")
    .eq("organization_id", workspace.id);

  const eventIds = (events || []).map(e => e.id);

  let temporaryVolunteers: any[] = [];
  if (eventIds.length > 0) {
    const { data: codes } = await adminClient
      .from("event_scan_codes")
      .select(`
        id,
        code,
        expires_at,
        created_at,
        event:event_id (
          title
        )
      `)
      .in("event_id", eventIds);

    temporaryVolunteers = (codes || [])
      .filter((c: any) => new Date(c.expires_at).getTime() > Date.now())
      .map((c: any) => ({
        id: c.id,
        name: `Access Code: ${c.code}`,
        email: `Event: ${c.event?.title || "N/A"}`,
        status: "active",
        lastActive: c.created_at,
        type: "Temporary"
      }));
  }

  // 3. Fetch Recent Volunteer Activity Logs
  const { data: logs } = await adminClient
    .from("organization_activity_logs")
    .select(`
      id,
      action_type,
      details,
      created_at,
      event:event_id (
        title
      ),
      profile:user_id (
        full_name
      )
    `)
    .eq("organization_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const activityLogs = (logs || []).map((l: any) => ({
    id: l.id,
    volunteerName: l.profile?.full_name || (l.details?.temporaryCode ? `Code: ${l.details.temporaryCode}` : "Volunteer"),
    actionType: l.action_type,
    eventTitle: l.event?.title || "Event",
    createdAt: l.created_at,
    details: l.details
  }));

  return (
    <VolunteersMonitorClient
      workspaceName={workspace.name}
      registeredVolunteers={registeredVolunteers}
      temporaryVolunteers={temporaryVolunteers}
      activityLogs={activityLogs}
    />
  );
}
