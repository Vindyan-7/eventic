import { requireOrgAdmin } from "@/lib/org-auth";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

export default async function OrgAnalyticsPage() {
    await requireOrgAdmin();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">Deep dive into your event performance and attendee engagement.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Views"
                    value="45,231"
                    icon={Activity}
                    trend={{ value: 12.5, label: "from last period", isPositive: true }}
                />
                <StatsCard
                    title="Conversion Rate"
                    value="3.2%"
                    icon={TrendingUp}
                    trend={{ value: 0.4, label: "from last period", isPositive: true }}
                />
                <StatsCard
                    title="Total Revenue"
                    value="$12,450"
                    icon={DollarSign}
                />
                <StatsCard
                    title="Unique Attendees"
                    value="2,840"
                    icon={Users}
                />
            </div>

            <div className="h-[400px] flex items-center justify-center border rounded-xl bg-card">
                <p className="text-muted-foreground">Detailed analytics charts and data visualizations will appear here.</p>
            </div>
        </div>
    );
}
