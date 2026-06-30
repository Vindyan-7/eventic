import { requireOrgAdminOrScanner } from "@/lib/org-auth";
import { getEventForScanner } from "@/services/event-management";
import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { VolunteerDashboardClient } from "@/components/event/volunteer-dashboard-client";

export default async function ScanPage({
  params,
}: {
  params: Promise<{
    eventId: string;
  }>;
}) {
  const { eventId } = await params;
  const auth = await requireOrgAdminOrScanner(eventId);

  const event = await getEventForScanner(eventId);
  if (!event) {
    notFound();
  }

  const supabase = await createAdminClient();

  // Load workspace details
  const { data: eventOrg } = await supabase
    .from("events")
    .select(`
      organization:organization_id (name)
    `)
    .eq("id", eventId)
    .maybeSingle();

  const workspaceName = (eventOrg as any)?.organization?.name || "Workspace";

  // Resolve volunteer display name
  let volunteerName = "Temporary Volunteer";
  if (auth.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", auth.user.id)
      .maybeSingle();
    volunteerName = profile?.full_name || "Registered Volunteer";
  } else if (auth.type === "temporary" && auth.code) {
    volunteerName = `Temporary Volunteer (${auth.code})`;
  }

  const isOwnerOrAdmin = auth.type === "owner";

  return (
    <VolunteerDashboardClient
      eventId={eventId}
      initialEvent={event}
      volunteerName={volunteerName}
      workspaceName={workspaceName}
      isOwnerOrAdmin={isOwnerOrAdmin}
    />
  );
}