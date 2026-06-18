import { requireOrgAdmin } from "@/lib/org-auth";
import { getOrganizationAnalytics } from "@/services/org-dashboard";

export default async function OrgDashboardPage() {
    await requireOrgAdmin();

    const analytics =
        await getOrganizationAnalytics();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">
                    Organization Dashboard
                </h1>

                <p className="text-muted-foreground mt-2">
                    Overview of your events and performance.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border p-6">
                    <p className="text-sm text-muted-foreground">
                        Total Events
                    </p>

                    <h2 className="text-4xl font-bold mt-3">
                        {analytics?.totalEvents || 0}
                    </h2>
                </div>

                <div className="rounded-2xl border p-6">
                    <p className="text-sm text-muted-foreground">
                        Registrations
                    </p>

                    <h2 className="text-4xl font-bold mt-3">
                        {analytics?.totalRegistrations || 0}
                    </h2>
                </div>

                <div className="rounded-2xl border p-6">
                    <p className="text-sm text-muted-foreground">
                        Revenue
                    </p>

                    <h2 className="text-4xl font-bold mt-3">
                        ₹{analytics?.totalRevenue || 0}
                    </h2>
                </div>
            </div>
        </div>
    );
}