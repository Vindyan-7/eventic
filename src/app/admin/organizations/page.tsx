import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { OrganizationsClient } from "./organizations-client";

export default async function AdminOrganizationsPage() {
  // Ensure access clearance
  await requireRole(["super_admin", "platform_admin", "moderator", "viewer"]);

  const adminClient = await createAdminClient();
  
  // Query organizations along with owner and event relations
  const { data: orgs, error } = await adminClient
    .from("organizations")
    .select(`
      *,
      owner:owner_id (
        email,
        full_name
      ),
      events (
        id,
        event_registrations (
          id,
          payments (
            amount,
            status
          )
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to query organizations for admin panel:", error);
  }

  // Format organization data calculating total host revenue aggregates
  const formattedOrgs = (orgs || []).map((o: any) => {
    let totalRevenue = 0;
    (o.events || []).forEach((e: any) => {
      (e.event_registrations || []).forEach((r: any) => {
        (r.payments || []).forEach((p: any) => {
          if (p.status === "paid") {
            totalRevenue += Number(p.amount);
          }
        });
      });
    });

    return {
      id: o.id,
      name: o.name,
      slug: o.slug,
      logo_url: o.logo_url,
      website: o.website,
      description: o.description,
      verification_status: o.verification_status || "pending",
      is_suspended: o.is_suspended || false,
      created_at: o.created_at,
      owner_name: o.owner?.full_name || "Eventic User",
      owner_email: o.owner?.email || "",
      events_count: o.events?.length || 0,
      revenue: totalRevenue
    };
  });

  return <OrganizationsClient initialOrganizations={formattedOrgs} />;
}
